import type { ASTNodeParser } from './NodeParser';
import type { ASTEventParser } from './EventParser';
import { AddParser } from './math/Add';
import { SubtractParser } from './math/Subtract';
import { MultiplyParser } from './math/Multiply';
import { DivideParser } from './math/Divide';
import { ModulusParser } from './math/Modulus';
import { PowerParser } from './math/Power';
import { ComparisonParser } from './logic/Comparison';
import { LogicOpParser } from './logic/LogicOp';
import { NotParser } from './logic/Not';
import { IfParser } from './logic/If';
import { WhileLoopParser } from './logic/WhileLoop';
import { DeclareVariableParser } from './variables/DeclareVariable';
import { SetVariableParser } from './variables/SetVariable';
import { ObjectAccessorParser } from './variables/ObjectAccessor';
import { WaitParser } from './logic/Wait';
import { ForLoopParser } from './logic/ForLoop';
import { BreakParser, ContinueParser } from './logic/LoopControl';
import { ArrayBuilderParser } from './data/ArrayBuilder';
import { ConsoleLogParser } from './actions/ConsoleLog';
import { SendMessageParser } from './actions/SendMessage';

import { OnReadyParser } from './events/OnReady';
import { OnMessageCreateParser } from './events/OnMessageCreate';
import { OnCommandParser } from './events/OnCommand';
import { OnSlashCommandParser } from './events/OnSlashCommand';
import { OnInteractionCreateParser } from './events/OnInteractionCreate';

import { StringParser } from './primitives/String';
import { NumberParser } from './primitives/Number';
import { BooleanParser } from './primitives/Boolean';

export class ParserRegistry {
    private parsers: Map<string, ASTNodeParser> = new Map();
    private eventParsers: Map<string, ASTEventParser> = new Map();

    constructor() {
        this.registerDefaults();
    }

    private registerDefaults() {
        // --- Events ---
        this.registerEvent('On Ready', new OnReadyParser());
        this.registerEvent('On Message Create', new OnMessageCreateParser());
        this.registerEvent('On Command', new OnCommandParser());
        this.registerEvent('On Slash Command', new OnSlashCommandParser());
        this.registerEvent('On Interaction Create', new OnInteractionCreateParser());

        // Aliases for Interaction Events
        this.registerEvent('On Button Click', new OnInteractionCreateParser());
        this.registerEvent('On Modal Submit', new OnInteractionCreateParser());

        // --- Primitives ---
        this.register('String', new StringParser());
        this.register('Number', new NumberParser());
        this.register('Boolean', new BooleanParser());

        // --- Math ---
        this.register('Add', new AddParser());
        this.register('Subtract', new SubtractParser());
        this.register('Multiply', new MultiplyParser());
        this.register('Divide', new DivideParser());
        this.register('Modulus', new ModulusParser());
        this.register('Power', new PowerParser());

        // --- Logic ---
        this.register('Comparison', new ComparisonParser());
        this.register('Logic Op', new LogicOpParser());
        this.register('Not', new NotParser());
        this.register('If', new IfParser());
        this.register('While Loop', new WhileLoopParser());
        this.register('Wait', new WaitParser());
        this.register('For Loop', new ForLoopParser());
        this.register('Break', new BreakParser());
        this.register('Continue', new ContinueParser());

        // --- Variables ---
        this.register('Declare Variable', new DeclareVariableParser());
        this.register('Set Variable', new SetVariableParser());
        this.register('Get Property', new ObjectAccessorParser());

        // --- Data ---
        this.register('Array Builder', new ArrayBuilderParser());

        // --- Actions ---
        this.register('Console Log', new ConsoleLogParser());
        this.register('Send Message', new SendMessageParser());
    }

    register(key: string, parser: ASTNodeParser) {
        this.parsers.set(key, parser);
    }

    registerEvent(key: string, parser: ASTEventParser) {
        this.eventParsers.set(key, parser);
    }

    // Node Parser Helper
    getParser(nodeCodeType: string | undefined, nodeLabel: string): ASTNodeParser | undefined {
        if (nodeCodeType && this.parsers.has(nodeCodeType)) {
            return this.parsers.get(nodeCodeType);
        }
        return this.parsers.get(nodeLabel);
    }

    // Event Parser Helper
    getEventParser(nodeCodeType: string | undefined, nodeLabel: string): ASTEventParser | undefined {
        if (nodeCodeType && this.eventParsers.has(nodeCodeType)) {
            return this.eventParsers.get(nodeCodeType);
        }
        return this.eventParsers.get(nodeLabel);
    }
}

export const registry = new ParserRegistry();
