import * as streamBox from 'streambox-collection'
import { ServiceError } from 'grpc'
import { User } from '../typedefs/users_pb'
import { client } from './client'

function createUser() {
	const reqBody = new User()
	reqBody.setId(3)
	reqBody.setName('restu wahyu saputra')
	reqBody.setAge(24)

	client.createNewUser(reqBody, (error: ServiceError, res: User) => {
		if (error) console.error(error.code)
		streamBox
			.object(reqBody.toObject())
			.then((res) => console.log(streamBox.toObject(res)))
			.catch(console.error)
	})
}

createUser()
