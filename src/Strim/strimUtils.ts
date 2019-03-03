import {
  IStrim,
  IStrimExecFuncData,
  Environment,
} from './types'
import Strim from './Strim';

export const splitToEnvironment = (items: (IStrim | IStrimExecFuncData | Environment)[]): Strim[] => {
  return items.reduce((strims, current) => {
    // @ts-ignore
    if(current in Environment) {
      strims.push(new Strim(current as Environment));
    }else{
      strims[strims.length - 1].pipe(current as IStrimExecFuncData);
    }

    return strims;
  }, [new Strim()]);
};

export const getDefaultEnv = () => {
  return (typeof window !== 'undefined' && typeof window.document !== 'undefined') ? Environment.Client : Environment.Server;
};

export const executePipedFunc = (execFuncData: IStrimExecFuncData, currentComputedValue) => {
  const {module, func, args} = execFuncData;
  import(module).then(src => {
     return src[func](currentComputedValue, ...args)
  })
};
