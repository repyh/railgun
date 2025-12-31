import type { ASTNodeParser } from './NodeParser';
import type { ASTEventParser } from './EventParser';

// Events
import { OnReadyParser } from './events/OnReady';
import { OnMessageCreateParser } from './events/OnMessageCreate';
import { OnCommandParser } from './events/OnCommand';
import { OnSlashCommandParser } from './events/OnSlashCommand';
import { OnInteractionCreateParser } from './events/OnInteractionCreate';

// Primitives
import { StringParser } from './primitives/String';
import { NumberParser } from './primitives/Number';
import { BooleanParser } from './primitives/Boolean';

// Logic
import { IfParser } from './logic/If';
import { WhileLoopParser } from './logic/WhileLoop';
import { DoWhileLoopParser } from './logic/DoWhileLoop';
import { ForLoopParser } from './logic/ForLoop';
import { BreakParser, ContinueParser } from './logic/LoopControl';
import { ComparisonParser } from './logic/Comparison';
import { LogicOpParser } from './logic/LogicOp';
import { NotParser } from './logic/Not';
import { WaitParser } from './logic/Wait';

// Variables
import { DeclareVariableParser } from './variables/DeclareVariable';
import { SetVariableParser } from './variables/SetVariable';
import { IncrementParser } from './variables/Increment';
import { ObjectAccessorParser } from './variables/ObjectAccessor';

// Math
import { AddParser } from './math/Add';
import { SubtractParser } from './math/Subtract';
import { MultiplyParser } from './math/Multiply';
import { DivideParser } from './math/Divide';
import { PowerParser } from './math/Power';
import { ModulusParser } from './math/Modulus';
import { MathAssignmentParser } from './math/MathAssignment';

// Data
import { ArrayBuilderParser } from './data/ArrayBuilder';
import { SplitterParser } from './data/Splitter';

// Actions & Discord
import { ConsoleLogParser } from './actions/ConsoleLog';
import { SendMessageParser } from './discord/SendMessage';
import { EmbedParser } from './discord/Embed';
import { EmbedFieldParser } from './discord/EmbedField';
import { ButtonParser } from './discord/Button';
import { ActionRowParser } from './discord/ActionRow';
import { ShowModalParser } from './discord/ShowModal';
import { MemberActionParser } from './discord/MemberActions';
import { EditMessageParser } from './discord/EditMessage';
import { DeleteMessageParser } from './discord/DeleteMessage';
import { AwaitComponentParser } from './discord/AwaitComponent';

// Functions
import { FunctionDefParser } from './functions/FunctionDef';
import { CallFunctionParser } from './functions/CallFunction';
import { ReturnParser } from './functions/Return';

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
        this.register('Math Assignment', new MathAssignmentParser());

        // --- Logic ---
        this.register('Comparison', new ComparisonParser());
        this.register('Logic Op', new LogicOpParser());
        this.register('Not', new NotParser());
        this.register('If', new IfParser());
        this.register('While Loop', new WhileLoopParser());
        this.register('Do-While Loop', new DoWhileLoopParser());
        this.register('Wait', new WaitParser());
        this.register('For Loop', new ForLoopParser());
        this.register('Break', new BreakParser());
        this.register('Continue', new ContinueParser());

        // --- Variables ---
        this.register('Declare Variable', new DeclareVariableParser());
        this.register('Set Variable', new SetVariableParser());
        this.register('Increment', new IncrementParser());
        this.register('Get Property', new ObjectAccessorParser());

        // --- Data ---
        this.register('Array Builder', new ArrayBuilderParser());
        this.register('Splitter', new SplitterParser());

        // --- Actions ---
        this.register('Console Log', new ConsoleLogParser());
        this.register('Send Message', new SendMessageParser());
        this.register('Construct Embed', new EmbedParser());
        this.register('Embed Field', new EmbedFieldParser());
        this.register('Create Button', new ButtonParser());
        this.register('Create Action Row', new ActionRowParser());
        this.register('Show Modal', new ShowModalParser());
        this.register('Kick Member', new MemberActionParser('kick'));
        this.register('Ban Member', new MemberActionParser('ban'));
        this.register('Edit Message', new EditMessageParser());
        this.register('Delete Message', new DeleteMessageParser());
        this.register('Wait for Interaction', new AwaitComponentParser());

        // --- Functions ---
        this.register('Function Def', new FunctionDefParser());
        this.register('Call Function', new CallFunctionParser());
        this.register('Return', new ReturnParser());
    }

    register(nodeType: string, parser: ASTNodeParser) {
        this.parsers.set(nodeType, parser);
    }

    getParser(codeType: string, label: string): ASTNodeParser | undefined {
        return this.parsers.get(codeType) || this.parsers.get(label);
    }

    registerEvent(eventType: string, parser: ASTEventParser) {
        this.eventParsers.set(eventType, parser);
    }

    getEventParser(eventType: string): ASTEventParser | undefined {
        return this.eventParsers.get(eventType);
    }
}

export const registry = new ParserRegistry();
