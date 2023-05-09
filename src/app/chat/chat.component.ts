import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Chat } from 'src/models/chat.class';
import { Observable, tap } from 'rxjs';
import { JsonMessage, Message } from 'src/models/message.class';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from '../profile/profile.component';
import { DialogUserInfoComponent } from '../dialog-user-info/dialog-user-info.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chatId: any = '';
  chat$: Observable<Chat>;
  allUsers;
  currentUserId: string;
  messageValue: string = '';
  myForm: FormGroup;
  user$ = this.usersService.currentUserProfile$;

  @ViewChild('chat') chatRef: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      myControl: ['', Validators.required],
    });
    this.route.paramMap.subscribe((paramMap) => {
      this.chatId = paramMap.get('id');
      if (this.chatId == null) {
        this.router.navigate(['/client/FV0OLfaDe9MkpvvH0l42']);
      } else {
        this.getChat();

        this.firestore
          .collection('users')
          .valueChanges({ idField: 'customIdName' })
          .subscribe((changes: any) => {
            this.allUsers = changes;
          });

        this.chat$ = this.getChat();
      }
    });

    this.usersService.currentUserProfile$.subscribe((userProfile) => {
      this.currentUserId = userProfile.uid;
    });
  }

  getChat() {
    return this.firestore
      .collection('chats')
      .doc(this.chatId)
      .valueChanges()
      .pipe(
        tap(() =>
          setTimeout(
            () =>
              Array.from(document.querySelectorAll('.chat-message'))
                .slice(-1)[0]
                ?.scrollIntoView(),
            0
          )
        )
      ) as Observable<Chat>;
  }

  sendMessage(message: string, chat: Chat) {
    if (message == '') {
    } else {
      let sentMessage = new Message({
        userId: this.currentUserId,
        message: message,
      });
      console.log(sentMessage);
      chat.messages.push(sentMessage.toJSON());
      this.firestore.collection('chats').doc(this.chatId).update(chat);
      this.messageValue = '';
    }
  }

  findUser(id: string) {
    return this.allUsers.filter((user) => user.customIdName === id)[0];
  }

  createGroupChat(name) {
    let chat = new Chat();
    chat.groupchat = true;
    chat.chatName = name;
    chat.userIds = [this.currentUserId];
    let firstMessage: JsonMessage = {
      createdAt: Intl.DateTimeFormat('de-DE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
      message: 'Welcome to the groupchat ' + chat.chatName + '.',
      userId: 'vs2DTr1B3vqplKnTZx7O',
    };
    chat.messages = [firstMessage];

    this.firestore
      .collection('chats')
      .add(chat.toJSON())
      .then((result: any) => {
        console.log('Adding chat finished' + result);
      });
  }

  showChatName(chatName: string, groupchat: boolean, userIds: string[]) {
    if (groupchat == true) {
      return chatName;
    } else {
      if (userIds[0] == this.currentUserId) {
        return this.allUsers.filter(
          (user) => user.customIdName === userIds[1]
        )[0].displayName;
      } else {
        return this.allUsers.filter(
          (user) => user.customIdName === userIds[0]
        )[0].displayName;
      }
    }
  }

  showCurrentUserName(currentUserId) {
    return this.allUsers.filter(
      (user) => user.customIdName === currentUserId
    )[0].name;
  }

  showChatImg(groupchat: boolean, userIds: string[]) {
    if (groupchat == true) {
      return './assets/img/lock_black.png';
    } else {
      if (userIds[0] == this.currentUserId) {
        return this.allUsers.filter(
          (user) => user.customIdName === userIds[1]
        )[0].photoURL;
      } else {
        return this.allUsers.filter(
          (user) => user.customIdName === userIds[0]
        )[0].photoURL;
      }
    }
  }

  openEditDialog() {
    this.dialog.open(ProfileComponent);
  }

  openUserInfoDialog() {
    this.dialog.open(DialogUserInfoComponent);
  }
}
