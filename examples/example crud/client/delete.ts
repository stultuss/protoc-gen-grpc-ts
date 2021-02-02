import * as streamBox from 'streambox-collection'
import { ServiceError } from 'grpc'
import { UserList, UserId } from '../typedefs/users_pb'
import { client } from './client'

function deleteUser() {
	const params = new UserId()
	params.setId(2)

	client.deleteUser(params, (error: ServiceError, response: UserList) => {
		if (error) console.error(error)
		streamBox
			.object(response.toObject())
			.then((res) => console.log(streamBox.toObject(res)))
			.catch(console.error)
	})
}

deleteUser()
