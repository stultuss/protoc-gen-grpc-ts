import * as streamBox from 'streambox-collection'
import { ServiceError } from 'grpc'
import { User } from '../typedefs/users_pb'
import { client } from './client'

function updateUser() {
	const requestBody = new User()
	requestBody.setId(1)
	requestBody.setName('samsul rizal')
	requestBody.setAge(25)

	client.updateUser(requestBody, (error: ServiceError, response: User) => {
		if (error) console.error(error)
		streamBox
			.object(response.toObject())
			.then((res) => console.log(streamBox.toObject(res)))
			.catch(console.error)
	})
}

updateUser()
