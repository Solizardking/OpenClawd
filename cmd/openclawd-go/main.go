package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

const version = "0.1.0-robotics"

type robotConnectRequest struct {
	RobotID      string   `json:"robot_id"`
	RobotURL     string   `json:"robot_url,omitempty"`
	Wallet       string   `json:"wallet,omitempty"`
	Model        string   `json:"model,omitempty"`
	Capabilities []string `json:"capabilities,omitempty"`
}

type robotTaskRequest struct {
	RobotID      string   `json:"robot_id"`
	RobotURL     string   `json:"robot_url,omitempty"`
	Wallet       string   `json:"wallet,omitempty"`
	Model        string   `json:"model,omitempty"`
	Objective    string   `json:"objective"`
	AmountUSD    string   `json:"amount_usd,omitempty"`
	Service      string   `json:"service,omitempty"`
	PaymentRails []string `json:"payment_rails,omitempty"`
	Execute      bool     `json:"execute"`
}

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(2)
	}

	var err error
	switch os.Args[1] {
	case "version":
		fmt.Println("openclawd-go", version)
	case "doctor":
		err = runDoctor(os.Args[2:])
	case "install":
		err = runInstall(os.Args[2:])
	case "gateway":
		err = runGateway(os.Args[2:])
	case "robot":
		err = runRobot(os.Args[2:])
	default:
		usage()
		err = fmt.Errorf("unknown command %q", os.Args[1])
	}

	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

func usage() {
	fmt.Fprintln(os.Stderr, `openclawd-go - hardware-friendly OpenClawd robot gateway client

Commands:
  version
  doctor --gateway http://127.0.0.1:8788
  install --target /opt/openclawd --gateway http://127.0.0.1:8788 --robot-url http://robot.local:8080
  gateway connect --robot-id asimov-v1 --robot-url http://robot.local:8080 --wallet <pubkey>
  robot task --robot-id asimov-v1 --objective "inspect aisle B" --amount-usd 0.005 --pay-gateway https://pay.sh
`)
}

func runDoctor(args []string) error {
	fs := flag.NewFlagSet("doctor", flag.ExitOnError)
	gatewayURL := fs.String("gateway", envOr("OPENCLAWD_GATEWAY_URL", "http://127.0.0.1:8788"), "OpenClawd gateway URL")
	if err := fs.Parse(args); err != nil {
		return err
	}

	fmt.Printf("openclawd-go=%s go=%s os=%s arch=%s\n", version, runtime.Version(), runtime.GOOS, runtime.GOARCH)
	var out map[string]any
	if err := getJSON(*gatewayURL+"/health", &out); err != nil {
		return err
	}
	return printJSON(out)
}

func runInstall(args []string) error {
	fs := flag.NewFlagSet("install", flag.ExitOnError)
	target := fs.String("target", "/opt/openclawd", "install target directory")
	gatewayURL := fs.String("gateway", envOr("OPENCLAWD_GATEWAY_URL", "http://127.0.0.1:8788"), "OpenClawd gateway URL")
	robotURL := fs.String("robot-url", "", "robot HTTP/WebSocket control URL")
	robotID := fs.String("robot-id", "asimov-v1", "robot id")
	if err := fs.Parse(args); err != nil {
		return err
	}

	binDir := filepath.Join(*target, "bin")
	cfgDir := filepath.Join(*target, "etc")
	if err := os.MkdirAll(binDir, 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(cfgDir, 0o755); err != nil {
		return err
	}

	exe, err := os.Executable()
	if err != nil {
		return err
	}
	dst := filepath.Join(binDir, "openclawd-go")
	if err := copyFile(exe, dst, 0o755); err != nil {
		return err
	}

	cfg := map[string]string{
		"OPENCLAWD_GATEWAY_URL": strings.TrimRight(*gatewayURL, "/"),
		"OPENCLAWD_ROBOT_ID":    *robotID,
		"OPENCLAWD_ROBOT_URL":   *robotURL,
		"PAY_SH_GATEWAY_URL":    envOr("PAY_SH_GATEWAY_URL", "https://pay.sh"),
		"MPP_PROXY_URL":         envOr("MPP_PROXY_URL", "https://pay.sh/mpp"),
	}
	if err := writeEnv(filepath.Join(cfgDir, "openclawd-robot.env"), cfg); err != nil {
		return err
	}

	fmt.Println("installed", dst)
	fmt.Println("config", filepath.Join(cfgDir, "openclawd-robot.env"))
	fmt.Println("next: openclawd-go gateway connect --robot-id", *robotID)
	return nil
}

func runGateway(args []string) error {
	if len(args) < 1 || args[0] != "connect" {
		return fmt.Errorf("usage: openclawd-go gateway connect --robot-id <id> [--robot-url <url>]")
	}
	fs := flag.NewFlagSet("gateway connect", flag.ExitOnError)
	gatewayURL := fs.String("gateway", envOr("OPENCLAWD_GATEWAY_URL", "http://127.0.0.1:8788"), "OpenClawd gateway URL")
	req := robotConnectRequest{}
	fs.StringVar(&req.RobotID, "robot-id", envOr("OPENCLAWD_ROBOT_ID", "asimov-v1"), "robot id")
	fs.StringVar(&req.RobotURL, "robot-url", os.Getenv("OPENCLAWD_ROBOT_URL"), "robot HTTP/WebSocket control URL")
	fs.StringVar(&req.Wallet, "wallet", os.Getenv("OPENCLAWD_ROBOT_WALLET"), "robot Solana wallet pubkey")
	fs.StringVar(&req.Model, "model", "asimov-v1", "robot model")
	if err := fs.Parse(args[1:]); err != nil {
		return err
	}
	req.Capabilities = []string{"telemetry", "camera", "imu", "can-bus", "motion-control", "x402", "mpp", "pay-sh"}

	var out map[string]any
	if err := postJSON(*gatewayURL+"/api/robot/connect", req, &out); err != nil {
		return err
	}
	return printJSON(out)
}

func runRobot(args []string) error {
	if len(args) < 1 || args[0] != "task" {
		return fmt.Errorf("usage: openclawd-go robot task --robot-id <id> --objective <task>")
	}
	fs := flag.NewFlagSet("robot task", flag.ExitOnError)
	gatewayURL := fs.String("gateway", envOr("OPENCLAWD_GATEWAY_URL", "http://127.0.0.1:8788"), "OpenClawd gateway URL")
	payGateway := fs.String("pay-gateway", envOr("PAY_SH_GATEWAY_URL", "https://pay.sh"), "Pay.sh-compatible gateway")
	req := robotTaskRequest{}
	fs.StringVar(&req.RobotID, "robot-id", envOr("OPENCLAWD_ROBOT_ID", "asimov-v1"), "robot id")
	fs.StringVar(&req.RobotURL, "robot-url", os.Getenv("OPENCLAWD_ROBOT_URL"), "robot HTTP/WebSocket control URL")
	fs.StringVar(&req.Wallet, "wallet", os.Getenv("OPENCLAWD_ROBOT_WALLET"), "robot Solana wallet pubkey")
	fs.StringVar(&req.Model, "model", "asimov-v1", "robot model")
	fs.StringVar(&req.Objective, "objective", "", "robot task objective")
	fs.StringVar(&req.AmountUSD, "amount-usd", "0.005", "quoted task spend in USD")
	fs.StringVar(&req.Service, "service", "robotics-task-plugin", "paid service slug")
	fs.BoolVar(&req.Execute, "execute", false, "request live execution; gateway still requires OPENCLAWD_ROBOT_LIVE=1")
	if err := fs.Parse(args[1:]); err != nil {
		return err
	}
	if req.Objective == "" {
		return fmt.Errorf("--objective is required")
	}
	req.PaymentRails = []string{"x402", "mpp", "pay-sh"}
	os.Setenv("PAY_SH_GATEWAY_URL", *payGateway)

	var out map[string]any
	if err := postJSON(*gatewayURL+"/api/robot/task", req, &out); err != nil {
		return err
	}
	return printJSON(out)
}

func getJSON(url string, out any) error {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return decodeResponse(resp, out)
}

func postJSON(url string, in any, out any) error {
	payload, err := json.Marshal(in)
	if err != nil {
		return err
	}
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return decodeResponse(resp, out)
}

func decodeResponse(resp *http.Response, out any) error {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("%s: %s", resp.Status, strings.TrimSpace(string(body)))
	}
	if err := json.Unmarshal(body, out); err != nil {
		return err
	}
	return nil
}

func printJSON(v any) error {
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func copyFile(src, dst string, mode os.FileMode) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.OpenFile(dst, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, mode)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, in); err != nil {
		out.Close()
		return err
	}
	return out.Close()
}

func writeEnv(path string, values map[string]string) error {
	var b strings.Builder
	for _, key := range []string{"OPENCLAWD_GATEWAY_URL", "OPENCLAWD_ROBOT_ID", "OPENCLAWD_ROBOT_URL", "PAY_SH_GATEWAY_URL", "MPP_PROXY_URL"} {
		fmt.Fprintf(&b, "%s=%q\n", key, values[key])
	}
	return os.WriteFile(path, []byte(b.String()), 0o600)
}
