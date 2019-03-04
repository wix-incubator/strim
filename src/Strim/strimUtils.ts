import { IStrimExecFuncData, Environment, PipeItem } from '../types'
import Strim from './Strim'
import { from } from 'rxjs/observable/from'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { isObservable, of } from 'rxjs'
export const splitToEnvironment = (items: PipeItem[]): Strim[] => {
  return items.reduce(
    (strims, current) => {
      // @ts-ignore
      if (current in Environment) {
        strims.push(new Strim(current as Environment))
      } else {
        strims[strims.length - 1].pipe(current as IStrimExecFuncData)
      }

      return strims
    },
    [new Strim()],
  )
}

export const getDefaultEnv = () => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? Environment.Client
    : Environment.Server
}

export const getPipedFunc = async (execFuncData: IStrimExecFuncData) => {
  const { module, func, args } = execFuncData

  const src = await import('../../test/modules/globals')
  const result = src[func].apply(src, args)
  return isObservable(result) ? result : of(result)
}

export const runStrimFuncLocally = (
  currentComputedValue,
  execFuncDatas: IStrimExecFuncData[],
) => {
  // return execFuncDatas.reduce((observable, currentFuncData) => {
  //   //   // @ts-ignore
  //   //   return observable.pipe(fromPromise(getPipedFunc(currentFuncData)))
  //   // }, from(currentComputedValue))

  return getPipedFunc(execFuncDatas[0])
}
