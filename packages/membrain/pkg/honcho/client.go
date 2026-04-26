// Package honcho is a thin Go client stub for the Honcho reasoning-memory API
// (https://docs.honcho.dev). It mirrors the surface used by the OpenClawd
// honcho-bridge TypeScript package so the membrain daemon can push messages
// into the same workspace from Go-side ingestion paths.
//
// Status: stub. Only the calls used by the bridge contract are sketched.
// Wire-level implementation should be filled in once the daemon needs it.
package honcho

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

const defaultBaseURL = "https://api.honcho.dev"

// Config holds connection settings.
type Config struct {
	APIKey      string
	WorkspaceID string
	BaseURL     string
	HTTPClient  *http.Client
}

// Client is a minimal Honcho REST client.
type Client struct {
	cfg  Config
	http *http.Client
}

// New constructs a Client. APIKey is required.
func New(cfg Config) (*Client, error) {
	if cfg.APIKey == "" {
		return nil, errors.New("honcho: APIKey required")
	}
	if cfg.WorkspaceID == "" {
		cfg.WorkspaceID = "openclawd"
	}
	if cfg.BaseURL == "" {
		cfg.BaseURL = defaultBaseURL
	}
	hc := cfg.HTTPClient
	if hc == nil {
		hc = &http.Client{Timeout: 15 * time.Second}
	}
	return &Client{cfg: cfg, http: hc}, nil
}

// Message is a single message to add to a session.
type Message struct {
	PeerID  string `json:"peer_id"`
	Content string `json:"content"`
}

// AddMessages appends messages to a session, creating session/peers as needed.
// Stub: shape mirrors the documented endpoint; verify before relying on it.
func (c *Client) AddMessages(ctx context.Context, sessionID string, msgs []Message) error {
	path := fmt.Sprintf("/v3/workspaces/%s/sessions/%s/messages", c.cfg.WorkspaceID, sessionID)
	return c.post(ctx, path, map[string]any{"messages": msgs}, nil)
}

// Conclusion is a normalized representation conclusion.
type Conclusion struct {
	ID        string    `json:"id"`
	Kind      string    `json:"kind"`
	Content   string    `json:"content"`
	Premises  []string  `json:"premises,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// ListConclusions returns conclusions in the peer's representation since the cursor.
// Stub.
func (c *Client) ListConclusions(ctx context.Context, peerID string, since *time.Time) ([]Conclusion, error) {
	path := fmt.Sprintf("/v3/workspaces/%s/peers/%s/representation", c.cfg.WorkspaceID, peerID)
	if since != nil {
		path += fmt.Sprintf("?since=%s", since.UTC().Format(time.RFC3339))
	}
	var resp struct {
		Conclusions []Conclusion `json:"conclusions"`
	}
	if err := c.get(ctx, path, &resp); err != nil {
		return nil, err
	}
	return resp.Conclusions, nil
}

func (c *Client) post(ctx context.Context, path string, body any, out any) error {
	buf, err := json.Marshal(body)
	if err != nil {
		return err
	}
	return c.do(ctx, http.MethodPost, path, bytes.NewReader(buf), out)
}

func (c *Client) get(ctx context.Context, path string, out any) error {
	return c.do(ctx, http.MethodGet, path, nil, out)
}

func (c *Client) do(ctx context.Context, method, path string, body io.Reader, out any) error {
	req, err := http.NewRequestWithContext(ctx, method, c.cfg.BaseURL+path, body)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("honcho: %s %s -> %d: %s", method, path, resp.StatusCode, string(b))
	}
	if out == nil {
		return nil
	}
	return json.NewDecoder(resp.Body).Decode(out)
}
