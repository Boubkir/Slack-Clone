import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { UsersService } from '../services/users.service';
import { switchMap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chat } from 'src/models/chat.class';
import { JsonMessage } from 'src/models/message.class';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsDontMatch: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  allUsers;
  allChats: Chat[] = [];
  generalChat: Chat;
  currentUserId: string;
  generalChatId = 'JQnRfxS0R5DSVhtVq0rc';

  signUpForm = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordMatchValidator() }
  );

  name = this.signUpForm.get('name');
  email = this.signUpForm.get('email');
  password = this.signUpForm.get('password');
  confirmPassword = this.signUpForm.get('confirmPassword');

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private router: Router,
    private userService: UsersService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {}

  submit() {
    const { name, email, password } = this.signUpForm.value;

    if (!this.signUpForm.valid || !name || !password || !email) {
      return;
    }

    this.authService
      .signUp(email, password)
      .pipe(
        switchMap(({ user: { uid } }) =>
          this.userService.addUser({ uid, email, displayName: name })
        ),
        this.toast.observe({
          success: 'Congrats! You are all signed up',
          loading: 'Signing up...',
          error: ({ message }) => `${message}`,
        })
      )
      .subscribe(() => {
        this.router.navigate(['/client']);
      });
    setTimeout(() => {
      this.getUsers();
      setTimeout(() => {
        this.addDirectChats();
        this.addNewUserToGeneral();
      }, 5000);
    }, 1000);
  }

  getUsers() {
    this.userService.currentUserProfile$.subscribe((userProfile) => {
      this.currentUserId = userProfile.uid;
    });

    this.firestore
      .collection('users')
      .valueChanges({ idField: 'customIdName' })
      .subscribe((changes: any) => {
        this.allUsers = changes;
      });
  }

  findUser(id: string) {
    return this.allUsers.filter((user) => user.customIdName === id)[0];
  }

  addDirectChats() {
    let newUser = this.allUsers.filter(
      (user) => user.uid === this.currentUserId
    )[0];
    for (let i = 0; i < this.allUsers.length; i++) {
      let otherUser = this.allUsers[i];
      if (otherUser.uid == this.currentUserId) {
      } else {
        this.createNewDirectChat(newUser, otherUser, i);
      }
    }
  }

  createNewDirectChat(newUser, otherUser, i) {
    let chat = new Chat();
    chat.groupchat = false;
    chat.userIds = [newUser.uid, otherUser.uid];
    chat.messages = this.addFirstMessageInDirectChat(chat, newUser, otherUser);
    this.addDirectChatToFirebase(chat, i);
  }

  addFirstMessageInDirectChat(chat, newUser, otherUser) {
    let firstMessage: JsonMessage = {
      createdAt: Intl.DateTimeFormat('de-DE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
      message:
        'Welcome to the private chat of ' +
        this.findUser(newUser.uid).displayName +
        ' and ' +
        this.findUser(otherUser.uid).displayName +
        '.',
      userId: 'vs2DTr1B3vqplKnTZx7O',
      threadMessages: [],
    };
    chat.messages = [firstMessage];
    return chat.messages;
  }

  addDirectChatToFirebase(chat, i) {
    this.firestore
      .collection('chats')
      .add(chat.toJSON())
      .then((result: any) => {});
  }

  addNewUserToGeneral() {
    this.getAllChats();
    setTimeout(() => {
      this.addAllUserIdsToGeneralChat();
      let newGeneralChat = {
        chatName: this.generalChat.chatName,
        groupchat: this.generalChat.groupchat,
        userIds: this.generalChat.userIds,
        messages: this.generalChat.messages,
      };
      this.addNewUserToFireStore(newGeneralChat);
    }, 5000);
  }

  addAllUserIdsToGeneralChat() {
    let allUserIds = [];
    this.generalChat = this.findGeneralChat();
    this.allUsers.forEach((user) => {
      allUserIds.push(user.uid);
    });
    this.generalChat.userIds = allUserIds;
  }

  addNewUserToFireStore(newGeneralChat) {
    this.firestore
      .collection('chats')
      .doc(this.generalChatId)
      .update(newGeneralChat);
  }

  getAllChats() {
    this.firestore
      .collection('chats')
      .valueChanges({ idField: 'customIdName' })
      .subscribe((changes: any) => {
        this.allChats = changes;
      });
  }

  findGeneralChat() {
    return this.allChats.filter(
      (chat) => chat.chatName == 'General'
    )[0] as Chat;
  }
}
