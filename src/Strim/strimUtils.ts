import { IStrimExecFuncData, Environment, PipeItem } from '../types'
import Strim from './Strim'
import { isObservable, Observable, of } from 'rxjs'

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

const pipeableWrapper = (scope, func, args: any[] = []) => <T>(
  source: Observable<T>,
) =>
  new Observable<T>(observer => {
    return source.subscribe({
      next(x) {
        const result = func.apply(scope, [...args, x])

        if (isObservable(result)){
          result.subscribe(observer)
        }else{
          observer.next(result)
        }
      },
      error(err) {
        observer.error(err)
      },
      complete() {
        observer.complete()
      },
    })
  })

export const getPipedFunc = async (execFuncData: IStrimExecFuncData) => {
  const { module, func, args } = execFuncData

  const src = await import(module)
  return pipeableWrapper(src, src[func], args)

}

export const runStrimLocally = async (
  currentComputedValue,
  execFuncDatas: IStrimExecFuncData[],
) => {
  let observable = of(currentComputedValue)

  for (const execFuncData of execFuncDatas) {
    const pipedFunc = await getPipedFunc(execFuncData)

    // @ts-ignore
    observable = observable.pipe(pipedFunc)
  }

  return observable
}
