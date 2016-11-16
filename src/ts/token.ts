class Token {
    Operator:string;
    Identifier:string;
    Number:string;

    constructor() {
        this.Operator = 'Operator';
        this.Identifier = 'Identifier';
        this.Number = 'Number';
    }
}

export = Token;
