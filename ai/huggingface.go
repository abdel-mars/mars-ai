package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type HuggingFaceEngine struct {
	APIKey string
	Model  string
	Client *http.Client
}

func NewHuggingFaceEngine() *HuggingFaceEngine {
	return &HuggingFaceEngine{
		APIKey: os.Getenv("HF_API_KEY"),
		Model:  "mistralai/Mistral-7B-Instruct-v0.2",
		Client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

type hfRequest struct {
	Inputs string `json:"inputs"`
}

type hfResponse []struct {
	GeneratedText string `json:"generated_text"`
}

func (h *HuggingFaceEngine) Generate(prompt string) (string, error) {
	url := fmt.Sprintf("https://api-inference.huggingface.co/models/%s", h.Model)

	body, _ := json.Marshal(hfRequest{
		Inputs: prompt,
	})

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+h.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result hfResponse
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return "", err
	}

	if len(result) == 0 {
		return "", fmt.Errorf("empty response")
	}

	return result[0].GeneratedText, nil
}