import * as streamBox from 'streambox-collection'
import { User, Empty } from '../typedefs/users_pb'
import { client } from './client'

function createUser() {
	const reqBody = new User()
	reqBody.setId(3)
	reqBody.setName('restu wahyu saputra')
	reqBody.setAge(24)

	const stream = client.createUser(() => {})
	streamBox
		.object(reqBody.toObject())
		.then((res) => console.log(streamBox.toObject(res)))
		.catch(console.error)
	stream.end()
}

createUser()
