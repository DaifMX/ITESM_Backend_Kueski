///<reference path="../types/string-extended.d.ts" />

String.prototype.toTitleCase = function (): string { //Ejemplo: "HOLA MUNDO" -> "Hola Mundo"
    if (this.length == 0) return "";

    const finalString = this.split(" ").map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(" ");

    return finalString;
};

String.prototype.toUpperCaseFirstLetterOnly = function (): string { //Ejemplo: "HoLA MuNDo" -> "Hola mundo"
    if (this.length == 0) return "";

    const finalString = this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();

    return finalString;
};

//Corrige el string para que no tengo más de un espacio entre palabras ni espacios al final o principio del string.
//Ejemplo: " Hello   World " -> "Hello World"
String.prototype.correctSpaces = function (): string {
    let finalString = this.replace(/\s+/g, ' ');
    finalString = finalString.trim();
    
    return finalString; 
};

String.prototype.spacesToUnderscore = function (): string { // Ejemplo "Hola Mundo" -> "Hola_Mundo"
    const finalString = this.correctSpaces();

    return finalString.replaceAll(" ", "_");
};