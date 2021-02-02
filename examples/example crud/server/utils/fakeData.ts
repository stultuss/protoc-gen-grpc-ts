import { User } from '../../typedefs/users_pb'

export function UserToClass({ id, name, age }: User.AsObject) {
  const user = new User()
  user.setId(id)
  user.setName(name)
  user.setAge(age)
  return user
}

export const users: User[] = [
  { id: 1, name: 'John Doe', age: 25 },
  { id: 2, name: 'Jane Doe', age: 28 }
].map(UserToClass)
