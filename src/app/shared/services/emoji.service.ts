import { Injectable } from '@angular/core';
import { ChannelService } from '../../shared/services/channel.service';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  constructor(private channelService: ChannelService) { }

  selectedEmojis: string[] = [];

 addEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    const emoji = event['emoji']['native'];
    const userMatched = messageId === userId;
    const callFromSingleEmoji = calledFromFunction;

    const foundEmoji = this.checkAndAddEmoji(index, emoji, userId, userMatched);
    
    if (!foundEmoji) {
        this.addNewEmoji(index, emoji, userMatched, userId);
    }

    this.updateMessage(index);
}

checkAndAddEmoji(index: number, emoji: string, userId: string, userMatched: boolean): boolean {
    for (let i = 0; i < this.channelService.messages[index].emoji.length; i++) {
        if (this.channelService.messages[index].emoji[i].emoji === emoji) {
            if (!this.channelService.messages[index].emoji[i].users) {
                this.channelService.messages[index].emoji[i].users = [];
            }
            if (!userMatched && !this.channelService.messages[index].emoji[i].users.includes(userId)) {
                console.log("keine Nachricht von mir, es gibt einen emoji und ich habe noch nicht reagiert");
                this.channelService.messages[index].emoji[i].count++;
                this.channelService.messages[index].emoji[i].users.push(userId);
            }
            return true;
        }
    }
    return false;
}

addNewEmoji(index: number, emoji: string, userMatched: boolean, userId: string) {
    const count = 0;
    const users = userMatched ? [] : [userId];
    console.log(count, userMatched, emoji, users);
    this.channelService.messages[index].emoji.push({ emoji: emoji, count: count, users: users });
}

updateMessage(index: number) {
    if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
    } else {
        this.channelService.updateChannelMessage(this.channelService.messages[index]);
    }
}
  updateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    let emojiUserIds = this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].users;
    let emojiCount = this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count;

    //es muss nicht geprüft werden ob ein Emoji vorhanden ist. 
    // Prüfen, ob die Nachricht von mir stammt oder ob ich bereits reagiert habe
    if (messageId === userId || emojiUserIds.includes(userId)) {
      // Wenn der count des emojis 0 und die Reaktion mit mir zusammenhängt, soll dieses entfernt werden
      if (emojiCount === 0) {
        this.channelService.messages[currentMessageIndex].emoji.splice(currentEmojiIndex, 1);
      } else {
        // Wenn count > 0, den count um 1 verringern
        this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
        // Entfernen meiner Benutzer-ID aus der Liste der Reaktionen
        const userIndex = emojiUserIds.indexOf(userId);
        if (userIndex !== -1) {
          emojiUserIds.splice(userIndex, 1);
        }
      }
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[currentMessageIndex]);
      } else{
        this.channelService.updateChannelMessage(this.channelService.messages[currentMessageIndex])
      }
    } else {
      // Wenn die Nachricht nicht von mir stammt
      if (emojiUserIds.includes(userId)) {
        // Wenn count > 0, den count um 1 verringern
        if (emojiCount > 0) {
          this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
          // Entfernen meiner Benutzer-ID aus der Liste der Reaktionen
          const userIndex = emojiUserIds.indexOf(userId);
          if (userIndex !== -1) {
            emojiUserIds.splice(userIndex, 1);
          }
        }
      } else {
        // Wenn es bereits ein emoji gibt, soll der countWert erhöht werden
        this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count++;
        // Hinzufügen meiner Benutzer-ID zur Liste der Reaktionen
        emojiUserIds.push(userId);
      }
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[currentMessageIndex]);
      } else{
        this.channelService.updateChannelMessage(this.channelService.messages[currentMessageIndex])
      }
    }
  }

  addCheckEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, true)
  }

  addRaisedHandsEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, true)
  }

  addEmojiToEditedMessage(event: any, index: number) {
    console.log("test aus service");
    
  const selectedEmoji = event['emoji']['native'];
  this.selectedEmojis.push(selectedEmoji);
  this.channelService.messages[index].message += selectedEmoji;
}


}
