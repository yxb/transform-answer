import generate from '@babel/generator';
import transformer from '../src/index'

const expectCode = (ast) => {
  expect(
    generate(ast).code
  ).toMatchSnapshot();
}

const printCode = (ast) => {
  console.log(
    generate(ast).code
  );
}

it('works', () => {
  const ast = transformer({
    Pools: {
      requestType: "myRequest",
      responseType: "myResponse",
      queryInterface: 'myPoolsQuery',
      hookName: 'myUsePools',
      queryServiceFullName: 'myQueryService.myPools',
      keyName: 'myPoolsQuery',
    }
  });

  printCode(ast);
  expectCode(ast);
});
