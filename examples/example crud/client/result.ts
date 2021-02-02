import * as streamBox from 'streambox-collection'
import { ServiceError } from 'grpc'
import { User, UserId, UserList } from '../typedefs/users_pb'
import { client } from './client'

function resultUser() {
	const params = new UserId()
	params.setId(1)

	client.getUser(params, (error: ServiceError, response: User) => {
		if (error) console.error(error)
		streamBox
			.object(response.toObject())
			.then((res) => console.log(streamBox.toObject(res)))
			.catch(console.error)
	})
}

resultUser()
