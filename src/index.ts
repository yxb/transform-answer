import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';

export default (transformParams) => {
  const plugins = [
    'objectRestSpread',
    'classProperties',
    'optionalCatchBinding',
    'asyncGenerators',
    'decorators-legacy',
    'typescript',
    'dynamicImport'
  ];

  const template =
    `export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> {
    request?: QueryPoolsRequest;
}
const usePools = <TData = QueryPoolsResponse,>({
    request,
    options
}: UsePoolsQuery<TData>) => {
    return useQuery<QueryPoolsResponse, Error, TData>(["poolsQuery", request], () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.pools(request);
    }, options);
};`

  const {
    requestType = 'QueryPoolsRequest',
    responseType = 'QueryPoolsResponse',
    queryInterface = 'UsePoolsQuery',
    hookName = 'usePools',
    queryServiceFullName = 'queryService.pools',
    keyName = 'poolsQuery',
  } = transformParams.Pools;

  const methodRegex = /[a-zA-Z_0-9]+\.[a-zA-Z_0-9]+/;
  if (!methodRegex.test(queryServiceFullName)) {
    throw new Error("Query service method name is invalid")
  }

  const fullNameSplit = queryServiceFullName.split('.');
  const [serviceName, methodeName] = [fullNameSplit[0], fullNameSplit[1]];

  const ast = parse(template, {
    sourceType: 'module',
    plugins: plugins as any,
  });

  babelTraverse(ast as any, {
    enter(path) {
      const node = path.node as any;
      if (node.type === 'Identifier') {
        switch (node.name) {
          case 'QueryPoolsRequest':
            node.name = requestType;
            break;
          case 'QueryPoolsResponse':
            node.name = responseType
            break;
          case 'UsePoolsQuery':
            node.name = queryInterface
            break;
          case 'usePools':
            node.name = hookName
            break;
          case 'queryService':
            node.name = serviceName
            break;
          case 'pools':
            node.name = methodeName
            break;
        }
      } else if (node.type === 'StringLiteral') {
        if (node.value === 'poolsQuery') {
          node.value = keyName;
        }
      }
    },
  });

  return ast;
};
