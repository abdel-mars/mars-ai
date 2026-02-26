package main

import "fmt"

type Persona struct {
    Name        string
    Tone        string
    Style       string
    Philosophy  string
}

var Mars2046 = Persona{
    Name:       "Mars AI 2046",
    Tone:       "calm, visionary, precise",
    Style:      "short, philosophical sentences",
    Philosophy: "Discipline builds destiny",
}

func GenerateMarsResponse(userMessage string) string {
	
    // Simple personality simulation
    return fmt.Sprintf(
        "%s says (%s, %s): \"%s\" — Remember: %s",
        Mars2046.Name,
        Mars2046.Tone,
        Mars2046.Style,
        userMessage,
        Mars2046.Philosophy,
    )
}