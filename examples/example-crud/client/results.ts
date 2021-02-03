import * as streamBox from 'streambox-collection'
import { User, Empty } from '../typedefs/users_pb'
import { client } from './client'

function resultsUser() {
	const stream = client.getUsers(new Empty())
	const users: User[] = []

	stream.on('data', (user) => users.push(user.toObject()))
	stream.on('error', console.error)
	stream.on('end', () => {
		streamBox
			.array(users)
			.then((res) => console.log(streamBox.toArray(res)))
			.catch(console.error)
	})
}

resultsUser()
