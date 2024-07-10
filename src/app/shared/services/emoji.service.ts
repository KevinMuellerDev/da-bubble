import { Injectable } from '@angular/core';
import { ChannelService } from '../../shared/services/channel.service';
import { ThreadService } from '../../shared/services/thread.service';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  constructor(private channelService: ChannelService, private threadService: ThreadService) { }

  selectedEmojis: string[] = [];
  messageEdit: boolean = false;
  threadMessageEdit: boolean = false;
  openEditMessageToggle: boolean[] = [];
  openEditMessageToggleThread: boolean[] = [];
  editMessage: boolean[] = [];
  editMessageThread: boolean[] = [];
  showEmojiPickerArray: boolean[] = [];
  showEmojiPickerArrayThread: boolean[] = [];

  /**
   * Toggles the edit mode for messages in the channel or thread.
   * This function sets the `messageEdit` property to the opposite of its current value.
   */
  toggleEditMode() {
    this.messageEdit = !this.messageEdit;
  }

  /**
   * Initializes arrays for managing message editing, emoji picker visibility, and edit mode toggles.
   * @param source - The source of messages, either 'channel' or 'thread'.
   */
  initMaps(source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    this.showEmojiPickerArray = messages.map(() => false);
    this.showEmojiPickerArrayThread = messages.map(() => false);
    this.openEditMessageToggle = messages.map(() => false);
    this.openEditMessageToggleThread = messages.map(() => false);
    this.editMessage = messages.map(() => false);
    this.editMessageThread = messages.map(() => false);
  }

  /**
   * Adds an emoji to a message at the specified index.
   * @param event - The event object containing the emoji data.
   * @param index - The index of the message to add the emoji to.
   * @param messageId - The ID of the message.
   * @param userId - The ID of the user adding the emoji.
   * @param source - The source of messages, either 'channel' or 'thread'.
   * @param calledFromFunction - Indicates whether the function is called from another function (default: false).
   */
  addEmoji(event: any, index: number, messageId: string, userId: string, source: 'channel' | 'thread', calledFromFunction: boolean = false) {
    const emoji = event['emoji']['native'];
    const userMatched = messageId === userId;
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    const foundEmoji = this.checkAndAddEmoji(index, emoji, userId, userMatched, source);
    if (this.messageEdit || this.threadMessageEdit) {
      this.addEmojiToEditedMessage(index, emoji, source);
      return;
    }
    if (!foundEmoji) {
      this.addNewEmoji(index, emoji, userMatched, userId, source);
      this.updateMessage(index, source);
    }
  }

  /**
   * Checks if the given emoji already exists for the message at the specified index.
   * If the emoji exists, it increments the count and adds the user ID to the users array if the user is not matched.
   * If the emoji does not exist, it creates a new emoji object with the given emoji, count of 1, and an array containing the user ID.
   * @param index - The index of the message in the messages array.
   * @param emoji - The emoji to be checked and added.
   * @param userId - The ID of the user adding the emoji.
   * @param userMatched - Indicates whether the user ID matches the message ID.
   * @param source - The source of messages, either 'channel' or 'thread'.
   * @returns {boolean} - Returns true if the emoji was found and updated, otherwise returns false.
   */
  checkAndAddEmoji(index: number, emoji: string, userId: string, userMatched: boolean, source: 'channel' | 'thread'): boolean {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    for (let i = 0; i < messages[index].emoji.length; i++) {
      if (messages[index].emoji[i].emoji === emoji) {
        if (!messages[index].emoji[i].users) {
          messages[index].emoji[i].users = [];
        }
        if (!userMatched && !messages[index].emoji[i].users.includes(userId)) {
          messages[index].emoji[i].count++;
          messages[index].emoji[i].users.push(userId);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Adds a new emoji to the message at the specified index.
   * If the user ID matches the message ID, the users array in the emoji object is initialized as an empty array.
   * Otherwise, the user ID is added to the users array.
   * @param index - The index of the message in the messages array.
   * @param emoji - The emoji to be added to the message.
   * @param userMatched - Indicates whether the user ID matches the message ID.
   * @param userId - The ID of the user adding the emoji.
   * @param source - The source of messages, either 'channel' or 'thread'.
   */

  addNewEmoji(index: number, emoji: string, userMatched: boolean, userId: string, source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    const count = 1;
    const users = userMatched ? [] : [userId];
    messages[index].emoji.push({ emoji: emoji, count: count, users: users });
  }

  /**
   * Updates a message at the specified index in the messages array based on the source.
   * If the source is 'channel', it checks if the message is a direct message and updates it accordingly.
   * If the source is 'thread', it updates the message in the thread.
   * @param index - The index of the message to be updated in the messages array.
   * @param source - The source of messages, either 'channel' or 'thread'.
   */
  updateMessage(index: number, source: 'channel' | 'thread') {
    if (source === 'channel') {
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
      } else {
        this.channelService.updateChannelMessage(this.channelService.messages[index]);
      }
    } else {
      this.threadService.updateChannelMessage(this.threadService.messages[index]);
    }
  }

  /**
   * Updates the reaction for a specific emoji in a message.
   * @param currentEmojiIndex - The index of the emoji in the message's emoji array.
   * @param currentMessageIndex - The index of the message in the messages array.
   * @param currentEmoji - The emoji that the user has reacted with.
   * @param messageId - The ID of the message.
   * @param userId - The ID of the user who reacted.
   * @param source - The source of messages, either 'channel' or 'thread'.
   */
  updateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string, source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    const emojiUserIds = messages[currentMessageIndex].emoji[currentEmojiIndex].users;
    const emojiCount = messages[currentMessageIndex].emoji[currentEmojiIndex].count;
    this.updateUserEmojiReaction(messageId, userId, currentMessageIndex, currentEmojiIndex, emojiUserIds, emojiCount, messages);
    this.updateMessage(currentMessageIndex, source);
  }

  /**
   * Updates the reaction for a specific emoji in a message.
   * This function checks if the user has already reacted with the emoji and calls the appropriate method to modify the emoji users array and count.
   * @param messageId - The ID of the message.
   * @param userId - The ID of the user who reacted.
   * @param currentMessageIndex - The index of the message in the messages array.
   * @param currentEmojiIndex - The index of the emoji in the message's emoji array.
   * @param emojiUserIds - The array of user IDs who have reacted with the emoji.
   * @param emojiCount - The current count of reactions for the emoji.
   * @param messages - The array of messages.
   */
  updateUserEmojiReaction(messageId: string, userId: string, currentMessageIndex: number, currentEmojiIndex: number, emojiUserIds: string[], emojiCount: number, messages: any[]) {
    if (messageId === userId || emojiUserIds.includes(userId)) {
      this.modifyEmojiUsers(emojiUserIds, userId, currentMessageIndex, currentEmojiIndex, emojiCount, messages, 'remove');
    } else {
      this.modifyEmojiUsers(emojiUserIds, userId, currentMessageIndex, currentEmojiIndex, emojiCount, messages, 'add');
    }
  }

  /**
   * Modifies the emoji users array and count based on the specified action.
   * @param emojiUserIds - The array of user IDs who have reacted with the emoji.
   * @param userId - The ID of the user who reacted.
   * @param currentMessageIndex - The index of the message in the messages array.
   * @param currentEmojiIndex - The index of the emoji in the message's emoji array.
   * @param emojiCount - The current count of reactions for the emoji.
   * @param messages - The array of messages.
   * @param action - The action to be performed on the emoji users array and count. It can be either 'add' or 'remove'.
   */
  modifyEmojiUsers(emojiUserIds: string[], userId: string, currentMessageIndex: number, currentEmojiIndex: number, emojiCount: number, messages: any[], action: 'add' | 'remove') {
    if (action === 'remove') {
      if (emojiCount === 1) {
        messages[currentMessageIndex].emoji.splice(currentEmojiIndex, 1);
      } else {
        messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
        const userIndex = emojiUserIds.indexOf(userId);
        if (userIndex !== -1) {
          emojiUserIds.splice(userIndex, 1);
        }
      }
    } else {
      if (!emojiUserIds.includes(userId)) {
        messages[currentMessageIndex].emoji[currentEmojiIndex].count++;
        emojiUserIds.push(userId);
      }
    }
  }

  /**
   * Modifies the emoji users array and count based on the specified action.
   * @param emojiUserIds - The array of user IDs who have reacted with the emoji.
   * @param userId - The ID of the user who reacted.
   * @param currentMessageIndex - The index of the message in the messages array.
   * @param currentEmojiIndex - The index of the emoji in the message's emoji array.
   * @param emojiCount - The current count of reactions for the emoji.
   * @param messages - The array of messages.
   * @param action - The action to be performed on the emoji users array and count. It can be either 'add' or 'remove'.
   */
  addCheckEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string, source: 'channel' | 'thread'): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, source, true);
  }

  /**
   * Adds a raised hands emoji to the message at the specified index.
   * This function is a wrapper for the `addEmoji` method, specifically designed for adding raised hands emoji.
   * It calls the `addEmoji` method with the provided parameters and sets the `calledFromFunction` parameter to `true`.
   * @param event - The event object containing the emoji data.
   * @param currentMessageIndex - The index of the message in the messages array.
   * @param messageId - The ID of the message.
   * @param userId - The ID of the user adding the emoji.
   * @param source - The source of messages, either 'channel' or 'thread'.
   */
  addRaisedHandsEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string, source: 'channel' | 'thread'): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, source, true);
  }

  /**
   * Adds the given emoji to the edited message at the specified index.
   * @param index - The index of the message in the messages array.
   * @param emoji - The emoji to be added to the edited message.
   * @param source - The source of messages, either 'channel' or 'thread'.
   */
  addEmojiToEditedMessage(index: number, emoji: any, source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    messages[index].message += emoji;
    messages[index].edited = true;
  }
}
