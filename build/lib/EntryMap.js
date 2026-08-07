"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryMap = void 0;
class EntryMap {
    constructor() {
        this.messageEntryMap = {};
        this.enumEntryMap = {};
    }
    /**
     * 获取 MessageEntry 结构
     *
     * @param {string} scopeName
     * @return {MessageEntry | undefined}
     */
    getMessageEntry(scopeName) {
        return this.messageEntryMap[scopeName];
    }
    /**
     * 获取 EnumEntry
     *
     * @param {string} scopeName
     * @return {EnumEntry | undefined}
     */
    getEnumEntry(scopeName) {
        return this.enumEntryMap[scopeName];
    }
    /**
     * 将 fileDescriptor 中的内容进行解析，并填充到 messageEntry 和 enumEntry 中
     *
     * @param {FileDescriptorProto} fileDescriptor
     */
    parseFileDescriptor(fileDescriptor) {
        const scope = fileDescriptor.getPackage() || '';
        fileDescriptor.getMessageTypeList().forEach(messageType => {
            this.parseMessageNested(scope, fileDescriptor, messageType);
        });
        fileDescriptor.getEnumTypeList().forEach(enumType => {
            this.enumEntryMap[this.joinScope(scope, enumType.getName())] = {
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
    parseMessageNested(scope, fileDescriptor, message) {
        const messageEntry = {
            pkg: fileDescriptor.getPackage(),
            fileName: fileDescriptor.getName(),
            messageOptions: message.getOptions(),
            mapFieldOptions: message.getOptions() && message.getOptions().getMapEntry() ? {
                key: [message.getFieldList()[0].getType(), message.getFieldList()[0].getTypeName().slice(1)],
                value: [message.getFieldList()[1].getType(), message.getFieldList()[1].getTypeName().slice(1)],
            } : undefined,
        };
        const entryName = this.joinScope(scope, message.getName());
        this.messageEntryMap[entryName] = messageEntry;
        message.getNestedTypeList().forEach(nested => {
            this.parseMessageNested(this.joinScope(scope, message.getName()), fileDescriptor, nested);
        });
        message.getEnumTypeList().forEach(enumType => {
            const identifier = this.joinScope(this.joinScope(scope, message.getName()), enumType.getName());
            this.enumEntryMap[identifier] = {
                pkg: fileDescriptor.getPackage(),
                fileName: fileDescriptor.getName(),
                enumOptions: enumType.getOptions(),
            };
        });
    }
    /**
     * 拼接作用域与名称，空作用域时省略前导点。
     */
    joinScope(scope, name) {
        return scope ? scope + '.' + name : name;
    }
}
exports.EntryMap = EntryMap;
