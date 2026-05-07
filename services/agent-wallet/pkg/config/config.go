package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

// BootstrapEnv loads simple KEY=VALUE pairs from nearby .env files without
// forcing the wallet service to depend on the larger OpenClawd runtime module.
func BootstrapEnv() {
	cwd, err := os.Getwd()
	if err != nil {
		return
	}

	for _, path := range candidateEnvFiles(cwd) {
		loadEnvFile(path)
	}
}

func candidateEnvFiles(cwd string) []string {
	seen := map[string]bool{}
	var paths []string
	dir := cwd
	for {
		for _, name := range []string{".env", "env"} {
			path := filepath.Join(dir, name)
			if !seen[path] {
				seen[path] = true
				paths = append(paths, path)
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return paths
}

func loadEnvFile(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(strings.TrimPrefix(key, "export "))
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		value = strings.TrimSpace(value)
		value = strings.Trim(value, `"'`)
		_ = os.Setenv(key, value)
	}
}
