// @ts-check
// @ts-ignore
import { DefaultAzureCredential } from "@azure/identity"
import { CosmosClient } from '@azure/cosmos'
import Config from './mylife-datasource-config.js'
//	define class
class Datamanager {
	//	constructor
	constructor() {
		const oConfig=new Config()
		const oOptions={
			endpoint: oConfig.endpoint,
			key: oConfig.rw_id,
			userAgentSuffix: 'mylife-services-maht',
//			aadCredentials: new DefaultAzureCredential()
		}
		//	define variables
		this.client=new CosmosClient(oOptions)
		this.containerId=oConfig.db.container.id
		this.partitionId=oConfig.db.container.partitionId
		this.partitionKey=oConfig.db.container.coreId
		this.requestOptions={
			memberCoreId: oConfig.db.container.coreId,
			partitionKey: this.partitionKey,
			populateQuotaInfo: true, // set this to true to include quota information in the response headers
		}
		//	assign database and container
		this.database=this.client.database(oConfig.db.id)
		console.log(`database initialized: ${this.database.id}`)
		this.container=this.database.container(oConfig.db.container.id)
		console.log(`container initialized: ${this.container.id}`)
		this.core = null
	}
	//	init function
	async init() {
		//	assign core
		this.core=await this.container.item(this.partitionKey,this.partitionId).read()
		console.log(`core initialized: ${this.core.resource.id}`)
		return this
	}
	getCore(){
		return this.core?.resource
	}
	async getItem(_id,_options=this.requestOptions){
		return await this.container
			.item(_id,this.partitionId)
			.read(_options)
			.then(_item=>{
				return _item.resource
			})
			.catch(_err=>{
				console.log(_err)
				return null
			})
	}
	getPartitionId(){
		return this.partitionId
	}
	async find(_querySpec) {
		const { resources } = await this.container
			.items
			.query(_querySpec)
			.fetchAll()
		return resources
	}
/*

	async getItems(_querySpec,_options=this.requestOptions){
		return await this.container
			.items
			.query(_querySpec,_options)
			.fetchAll()
			.then(_items=>{
				return _items.resources
			})
			.catch(_err=>{
				console.log(_err)
				return null
			})
	}
	async addItem(item) {
		debug('Adding an item to the database')
		item.date = Date.now()
		item.completed = false
		const { resource: doc } = await this.container.items.create(item)
		return doc
	}

	async updateItem(itemId) {
		debug('Update an item in the database')
		const doc = await this.getItem(itemId)
		doc.completed = true

		const { resource: replaced } = await this.container
		.item(itemId, partitionKey)
		.replace(doc)
		return replaced
	}
*/
}
//	exports
export default Datamanager