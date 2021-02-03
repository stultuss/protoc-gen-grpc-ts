import * as grpc from 'grpc'
import { UsersService } from '../typedefs/users_grpc_pb'
import { UsersServer } from './service'

const server = new grpc.Server()
server.addService(UsersService, UsersServer)

server.bind(`localhost:${3000}`, grpc.ServerCredentials.createInsecure())
console.log(`server is running on ${3000}`)
server.start()
