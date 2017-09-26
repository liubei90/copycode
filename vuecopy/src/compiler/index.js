import { parse } from './parser/index';
import { optimize } from './optimizer';
import { generate } from './codegen/index';
import { createCompilerCreator } from './create-compiler';

export const createCompiler = createCompilerCreator(function baseCompile(template, options) {
  const ast = parse(template.trim(), options);  
  optimize(ast, options);
  const code = generate(ast, options);
  return {
    ast, 
    render: code.render, 
    staticRenderFns: code.staticRenderFns
  }
});