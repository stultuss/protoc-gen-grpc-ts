import { ServiceError } from 'grpc'
import { UserList, Empty } from '../typedefs/users_pb'
import { client } from './client'

function getNewUsers() {
	return new Promise<Uint8Array>((resolve, reject) => {
		client.getNewUsers(new Empty(), (error: ServiceError, response: UserList) => {
			if (error) reject(error)
			resolve(response.serializeBinary())
		})
	})
}

getNewUsers()
	.then((res) => console.log(UserList.deserializeBinary(res).toObject()))
	.catch((err) => console.log(err))
