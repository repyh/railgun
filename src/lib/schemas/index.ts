import type { NodeSchema } from '@/lib/railgun-flow';
import * as Events from './events';
import * as Discord from './discord';
import * as Logic from './logic';
import * as Variables from './variables';
import * as MathNodes from './math';
import * as Data from './data';
import * as Functions from './functions';

export const Schemas: NodeSchema[] = [
    ...Object.values(Events).map(s => s as NodeSchema),
    ...Object.values(Discord).map(s => s as NodeSchema),
    ...Object.values(Logic).map(s => s as NodeSchema),
    ...Object.values(Variables).map(s => s as NodeSchema),
    ...Object.values(MathNodes).map(s => s as NodeSchema),
    ...Object.values(Data).map(s => s as NodeSchema),
    ...Object.values(Functions).map(s => s as NodeSchema),
];
