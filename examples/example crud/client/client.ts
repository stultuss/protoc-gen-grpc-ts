import { UsersClient } from '../typedefs/users_grpc_pb'
import * as grpc from 'grpc'

export const client = new UsersClient(`localhost:${3000}`, grpc.credentials.createInsecure())
