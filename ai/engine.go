package ai


type AIEngine interface {
    Generate(prompt string) (string, error)
}

//parse it into a struct and then call the generate method on the struct