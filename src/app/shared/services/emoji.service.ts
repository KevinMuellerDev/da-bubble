import { Injectable } from '@angular/core';
import { ChannelService } from '../../shared/services/channel.service';
import { ThreadService } from '../../shared/services/thread.service';  // Make sure this service is correctly imported

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

  toggleEditMode() {
    this.messageEdit = !this.messageEdit;
  }

  initMaps(source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    this.showEmojiPickerArray = messages.map(() => false);
    this.showEmojiPickerArrayThread = messages.map(() => false);
    this.openEditMessageToggle = messages.map(() => false);
    this.openEditMessageToggleThread = messages.map(() => false);
    this.editMessage = messages.map(() => false);
    this.editMessageThread = messages.map(() => false);
  }

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

  addNewEmoji(index: number, emoji: string, userMatched: boolean, userId: string, source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    const count = 0;
    const users = userMatched ? [] : [userId];
    messages[index].emoji.push({ emoji: emoji, count: count, users: users });
  }

  updateMessage(index: number, source: 'channel' | 'thread') {
    if (source === 'channel') {
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
      } else {
        this.channelService.updateChannelMessage(this.channelService.messages[index]);
      }
    } else {
      //this.threadService.updateThreadMessage(this.threadService.messages[index]);
    }
  }

  updateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string, source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    let emojiUserIds = messages[currentMessageIndex].emoji[currentEmojiIndex].users;
    let emojiCount = messages[currentMessageIndex].emoji[currentEmojiIndex].count;

    if (messageId === userId || emojiUserIds.includes(userId)) {
      if (emojiCount === 0) {
        messages[currentMessageIndex].emoji.splice(currentEmojiIndex, 1);
      } else {
        messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
        const userIndex = emojiUserIds.indexOf(userId);
        if (userIndex !== -1) {
          emojiUserIds.splice(userIndex, 1);
        }
      }
    } else {
      if (emojiUserIds.includes(userId)) {
        if (emojiCount > 0) {
          messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
          const userIndex = emojiUserIds.indexOf(userId);
          if (userIndex !== -1) {
            emojiUserIds.splice(userIndex, 1);
          }
        }
      } else {
        messages[currentMessageIndex].emoji[currentEmojiIndex].count++;
        emojiUserIds.push(userId);
      }
    }

    this.updateMessage(currentMessageIndex, source);
  }

  addCheckEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string, source: 'channel' | 'thread'): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, source, true);
  }

  addRaisedHandsEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string, source: 'channel' | 'thread'): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, source, true);
  }

  addEmojiToEditedMessage(index: number, emoji: any, source: 'channel' | 'thread') {
    const messages = source === 'channel' ? this.channelService.messages : this.threadService.messages;
    messages[index].message += emoji;
    messages[index].edited = true;
  }
}
