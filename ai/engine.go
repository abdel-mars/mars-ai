package ai


type AIEngine interface {
    Generate(prompt string) (string, error)
}