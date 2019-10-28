import { exportAllDeclaration } from "@babel/types";

test('Add to Nums', () => {
  const sum = 1 + 2;
  exportAllDeclaration(sum).toEqual(3); 
})