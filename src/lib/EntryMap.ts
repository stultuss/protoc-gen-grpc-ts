import {
    DescriptorProto,
    EnumOptions,
    FieldDescriptorProto,
    FileDescriptorProto,
    MessageOptions
} from 'google-protobuf/google/protobuf/descriptor_pb';

export type MessageEntry = {
    pkg: string,
    fileName: string,
    messageOptions: MessageOptions,
    mapFieldOptions?: {
        key: [FieldDescriptorProto.Type, string],
        value: [FieldDescriptorProto.Type, string],
    }
}

export type EnumEntry = {
    pkg: string,
    fileName: string,
    enumOptions: EnumOptions,
}

export class EntryMap {
    messageEntryMap: {[key: string]: MessageEntry} = {};
    enumEntryMap: {[key: string]: EnumEntry} = {};

    /**
     * 获取 MessageEntry 结构
     *
     * @param {string} scopeName
     * @return {MessageEntry | undefined}
     */
    public getMessageEntry(scopeName: string): MessageEntry | undefined {
        return this.messageEntryMap[scopeName];
    }

    /**
     * 获取 EnumEntry
     *
     * @param {string} scopeName
     * @return {EnumEntry | undefined}
     */
    public getEnumEntry(scopeName: string): EnumEntry | undefined {
        return this.enumEntryMap[scopeName];
    }

    /**
     * 将 fileDescriptor 中的内容进行解析，并填充到 messageEntry 和 enumEntry 中
     *
     * @param {FileDescriptorProto} fileDescriptor
     */
    public parseFileDescriptor(fileDescriptor: FileDescriptorProto) {
        const scope = fileDescriptor.getPackage();
        fileDescriptor.getMessageTypeList().forEach(messageType => {
            this.parseMessageNested(scope, fileDescriptor, messageType);
        });

        fileDescriptor.getEnumTypeList().forEach(enumType => {
            this.enumEntryMap[scope + '.' + enumType.getName()] = {
                pkg: fileDescriptor.getPackage(),
                fileName: fileDescriptor.getName(),
                enumOptions: enumType.getOptions(),
            };
        });
    }

    /**
     * 解析 Message NestedType
     *
     * @param {string} scope
     * @param {FileDescriptorProto} fileDescriptor
     * @param {DescriptorProto} message
     */
    private parseMessageNested(scope: string, fileDescriptor: FileDescriptorProto, message: DescriptorProto) {
        const messageEntry: MessageEntry = {
            pkg: fileDescriptor.getPackage(),
            fileName: fileDescriptor.getName(),
            messageOptions: message.getOptions(),
            mapFieldOptions: message.getOptions() && message.getOptions().getMapEntry() ? {
                key: [message.getFieldList()[0].getType(), message.getFieldList()[0].getTypeName().slice(1)],
                value: [message.getFieldList()[1].getType(), message.getFieldList()[1].getTypeName().slice(1)],
            } : undefined,
        };

        const entryName = `${scope ? scope + '.' : ''}${message.getName()}`;
        this.messageEntryMap[entryName] = messageEntry;

        message.getNestedTypeList().forEach(nested => {
            this.parseMessageNested(scope + '.' + message.getName(), fileDescriptor, nested);
        });

        message.getEnumTypeList().forEach(enumType => {
            const identifier = scope + '.' + message.getName() + '.' + enumType.getName();
            this.enumEntryMap[identifier] = {
                pkg: fileDescriptor.getPackage(),
                fileName: fileDescriptor.getName(),
                enumOptions: enumType.getOptions(),
            };
        });
    }
}