import type { StatementGenerator, ValueGenerator } from './interfaces';
import { CallFunctionStatement } from './generators/statements/CallFunction';
import { BranchGenerator } from './generators/statements/Branch';
import { ForLoopGenerator } from './generators/statements/ForLoop';
import { ObjectAccessorGenerator } from './generators/values/ObjectAccessor';
import { ComparisonGenerator } from './generators/values/Comparison';
import { LogicOpGenerator } from './generators/values/LogicOp';
import { NotGenerator } from './generators/values/Not';
import { PowerGenerator } from './generators/values/Power';
import { IncrementGenerator } from './generators/statements/Increment';
import { MathAssignmentGenerator } from './generators/statements/MathAssignment';
import { ConstructEmbedValueGenerator } from './generators/values/ConstructEmbed';
import { ButtonValueGenerator } from './generators/values/Button';
import { ActionRowValueGenerator } from './generators/values/ActionRow';
import { SendMessageGenerator } from './generators/statements/SendMessage';
import { ShowModalGenerator } from './generators/statements/ShowModal';
import { EmbedFieldValueGenerator } from './generators/values/EmbedField';
import { ArrayBuilderValueGenerator } from './generators/values/ArrayBuilder';
import { SplitterValueGenerator } from './generators/values/Splitter';
import { WhileLoopGenerator } from './generators/statements/WhileLoop';
import { DoWhileLoopGenerator } from './generators/statements/DoWhileLoop';
import { WaitGenerator } from './generators/statements/Wait';
import { ConsoleLogGenerator } from './generators/statements/ConsoleLog';

/**
 * The Registry serves as the central directory for all code generators.
 * It maps Node Labels or Categories to their respective StatementGenerator (for actions)
 * or ValueGenerator (for data/value nodes).
 */
export class Registry {
    private static statements: Record<string, StatementGenerator> = {
        'If': BranchGenerator,
        'For Loop': ForLoopGenerator,
        'While Loop': WhileLoopGenerator,
        'Do-While Loop': DoWhileLoopGenerator,
        'Wait': WaitGenerator,
        'Call Function': CallFunctionStatement,
        'Increment': IncrementGenerator,
        'Math Assignment': MathAssignmentGenerator,
        'Send Message': SendMessageGenerator,
        'Show Modal': ShowModalGenerator,
        'Console Log': ConsoleLogGenerator,
    };
    private static values: Record<string, ValueGenerator> = {
        // Values (Keyed by Label or Category)
        'Construct Embed': ConstructEmbedValueGenerator,
        'Create Button': ButtonValueGenerator,
        'Create Action Row': ActionRowValueGenerator,
        'Get Property': ObjectAccessorGenerator,
        'Comparison': ComparisonGenerator,
        'Logic Op': LogicOpGenerator,
        'Not': NotGenerator,
        'Power': PowerGenerator,
        'Embed Field': EmbedFieldValueGenerator,
        'Array Builder': ArrayBuilderValueGenerator,
        'Splitter': SplitterValueGenerator,
    };

    /**
     * Registers a new Statement Generator for a specific node label.
     */
    static registerStatement(label: string, generator: StatementGenerator) {
        this.statements[label] = generator;
    }

    /**
     * Registers a new Value Generator for a specific node label or category.
     */
    static registerValue(categoryOrLabel: string, generator: ValueGenerator) {
        this.values[categoryOrLabel] = generator;
    }

    static unregisterStatement(label: string) {
        delete this.statements[label];
    }

    static unregisterValue(categoryOrLabel: string) {
        delete this.values[categoryOrLabel];
    }

    /**
     * Retrieves a Statement Generator by node label.
     */
    static getStatement(label: string): StatementGenerator | undefined {
        return this.statements[label];
    }

    /**
     * Retrieves a Value Generator by category.
     */
    static getValue(category: string): ValueGenerator | undefined {
        return this.values[category];
    }

    /**
     * Retrieves a Value Generator by specific node label.
     * Takes precedence over category-based lookup.
     */
    static getValueByLabel(label: string): ValueGenerator | undefined {
        return this.values[label];
    }
}
