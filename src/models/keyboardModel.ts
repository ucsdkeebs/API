import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyboard extends Document {
    keyboard_name: string;
    switch_name: string;
    layout: string;
    modded: boolean;
}

const KeyboardSchema: Schema<IKeyboard> = new Schema ({
    keyboard_name: { type: String, required: true },
    switch_name: { type: String, required: true },
    layout: { type: String, required: true },
    modded: { type: Boolean, required: true}
})

const Keyboard = mongoose.model<IKeyboard>('Keyboard', KeyboardSchema);
export default Keyboard;