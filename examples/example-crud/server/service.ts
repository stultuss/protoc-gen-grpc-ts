import { ServerUnaryCall, sendUnaryData, ServerWritableStream, ServerReadableStream } from 'grpc'
import { IUsersServer } from '../typedefs/users_grpc_pb'
import { UserId, User, Empty, UserList } from '../typedefs/users_pb'
import { users } from './utils/fakeData'

export const UsersServer: IUsersServer = {
  createUser(call: ServerReadableStream<User>, callback: sendUnaryData<Empty>) {
    call.on('data', (chunk) => console.log(chunk))
    call.on('end', () => callback(null, new Empty()))
  },
  createNewUser: (call: ServerUnaryCall<User>, callback: sendUnaryData<User>) => {
    if (call.request.toArray().length < 1) {
      callback(new Error('user already exist'), null)
      return
    }
    callback(null, call.request)
  },
  getUsers(call: ServerWritableStream<Empty>) {
    console.log(`getUsers: streaming all users.`)
    for (const user of users) call.write(user)
    call.end()
  },
  getNewUsers(call: ServerUnaryCall<Empty>, callback: sendUnaryData<UserList>) {
    const usersList = new UserList()
    usersList.setUsersList(users)
    callback(null, usersList)
  },
  getUser(call: ServerUnaryCall<UserId>, callback: sendUnaryData<User>) {
    const params = call.request.getId()
    const user = users.find((req) => req.getId() === params)
    callback(null, user)
  },
  deleteUser(call: ServerUnaryCall<UserId>, callback: sendUnaryData<UserList>) {
    const params = call.request.getId()
    const newUser = users.filter((req) => req.getId() !== params)

    const usersList = new UserList()
    usersList.setUsersList(newUser)

    callback(null, usersList)
  },
  updateUser(call: ServerUnaryCall<User>, callback: sendUnaryData<User>) {
    const newUser = users.find((req) => req.getId() === call.request.getId())
    newUser.setId(call.request.getId())
    newUser.setName(call.request.getName())
    newUser.setAge(call.request.getAge())

    callback(null, newUser)
  }
}
