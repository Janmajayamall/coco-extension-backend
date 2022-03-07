const { GraphQLClient, gql } = require("graphql-request");

const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT);

const QueryMarketByMarketIdentifier = gql`
	query ($marketIdentifiers: [Bytes!]!) {
		markets(where: { marketIdentifier_in: $marketIdentifiers }) {
			id
			marketIdentifier
			reserve0
			reserve1
			donBufferEndsAt
			donBuffer
			resolutionBufferEndsAt
			resolutionBuffer
			lastAmountStaked
			tokenC
			fee
			outcome
			donEscalationCount
		}
	}
`;

async function queryMarketsByMarketIdentifiers(marketIdentifiers) {
	const res = await client.request(QueryMarketByMarketIdentifier, {
		marketIdentifiers,
	});
	return res.markets;
}

module.exports = {
	queryMarketsByMarketIdentifiers,
};
