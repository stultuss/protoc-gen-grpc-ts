INPUT_DIR := ${realpath protos}
OUTPUT_DIR := ${realpath typedefs}
FIND_FILE := ${wildcard ${OUTPUT_DIR}/*.ts}
PROTOC_GEN_GRPC := protoc-gen-grpc

###########################################################
####=======================================================
#### GENERATE PROTO FILE FOR LINUX/MAC OR WINDOWS FOR grpc
####=======================================================
###########################################################

protocgen:
ifneq (${FIND_FILE}, )
#remove old all files typedefs
	rm ${OUTPUT_DIR}/**.{ts,js}

#generate typedefs protofile
	${PROTOC_GEN_GRPC} \
	--js_out=import_style=commonjs,binary:${OUTPUT_DIR} \
	--grpc_out=${OUTPUT_DIR} \
	--ts_out=protoc-gen-grpc-ts:${OUTPUT_DIR} \
	--proto_path ${INPUT_DIR} ${INPUT_DIR}/*.proto

else
#generate typedefs protofile if file not exist
	${PROTOC_GEN_GRPC} \
	--js_out=import_style=commonjs,binary:${OUTPUT_DIR} \
	--grpc_out=${OUTPUT_DIR} \
	--ts_out=protoc-gen-grpc-ts:${OUTPUT_DIR} \
	--proto_path ${INPUT_DIR} ${INPUT_DIR}/*.proto
endif