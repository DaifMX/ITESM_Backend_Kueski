declare global {
    interface String {
        toTitleCase(): string;
        toUpperCaseFirstLetterOnly(): string;
        correctSpaces(): string;
        spacesToUnderscore(): string;
    }
}

export {};