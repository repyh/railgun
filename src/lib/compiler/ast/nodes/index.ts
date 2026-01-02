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
        this.registerEvent('event/on-ready', new OnReadyParser());
        this.registerEvent('event/on-message-create', new OnMessageCreateParser());
        this.registerEvent('event/on-command', new OnCommandParser());
        this.registerEvent('event/slash-command', new OnSlashCommandParser());
        this.registerEvent('event/on-interaction-create', new OnInteractionCreateParser());

        // Aliases for Interaction Events
        this.registerEvent('event/on-button-click', new OnInteractionCreateParser());
        this.registerEvent('event/on-modal-submit', new OnInteractionCreateParser());

        // --- Primitives ---
        this.register('variables/string', new StringParser());
        this.register('variables/number', new NumberParser());
        this.register('variables/boolean', new BooleanParser());

        // --- Math ---
        this.register('math/add', new AddParser());
        this.register('math/subtract', new SubtractParser());
        this.register('math/multiply', new MultiplyParser());
        this.register('math/divide', new DivideParser());
        this.register('math/modulus', new ModulusParser());
        this.register('math/power', new PowerParser());
        this.register('variables/math-assignment', new MathAssignmentParser());

        // --- Logic ---
        this.register('logic/comparison', new ComparisonParser());
        this.register('logic/logic-op', new LogicOpParser());
        this.register('logic/not', new NotParser());
        this.register('logic/branch', new IfParser());
        this.register('logic/while-loop', new WhileLoopParser());
        this.register('logic/do-while-loop', new DoWhileLoopParser());
        this.register('logic/wait', new WaitParser());
        this.register('logic/for-loop', new ForLoopParser());
        this.register('logic/break', new BreakParser());
        this.register('logic/continue', new ContinueParser());

        // --- Variables ---
        this.register('variables/declare-variable', new DeclareVariableParser());
        this.register('variables/set-variable', new SetVariableParser());
        this.register('variables/increment', new IncrementParser());
        this.register('variables/object-accessor', new ObjectAccessorParser());

        // --- Data ---
        this.register('data/array-builder', new ArrayBuilderParser());
        this.register('data/splitter', new SplitterParser());

        // --- Actions ---
        this.register('action/console-log', new ConsoleLogParser());
        this.register('discord/send-message', new SendMessageParser());
        this.register('discord/construct-embed', new EmbedParser());
        this.register('data/embed-field', new EmbedFieldParser());
        this.register('discord/create-button', new ButtonParser());
        this.register('discord/create-action-row', new ActionRowParser());
        this.register('discord/show-modal', new ShowModalParser());
        this.register('discord/kick-member', new MemberActionParser('kick'));
        this.register('discord/ban-member', new MemberActionParser('ban'));
        this.register('discord/add-role', new MemberActionParser('addRole'));
        this.register('discord/remove-role', new MemberActionParser('removeRole'));
        this.register('discord/edit-message', new EditMessageParser());
        this.register('discord/delete-message', new DeleteMessageParser());
        this.register('discord/await-component', new AwaitComponentParser());

        // --- Functions ---
        this.register('functions/def', new FunctionDefParser());
        this.register('functions/call', new CallFunctionParser());
        this.register('functions/return', new ReturnParser());
    }

    register(nodeType: string, parser: ASTNodeParser) {
        this.parsers.set(nodeType, parser);
    }

    getParser(schemaId: string, label: string): ASTNodeParser | undefined {
        return this.parsers.get(schemaId) || this.parsers.get(label);
    }

    registerEvent(eventType: string, parser: ASTEventParser) {
        this.eventParsers.set(eventType, parser);
    }

    getEventParser(schemaId: string, label: string): ASTEventParser | undefined {
        return this.eventParsers.get(schemaId) || this.eventParsers.get(label);
    }
}

export const registry = new ParserRegistry();
