import {
  IStrimExecFuncDataPiped,
  Environment,
  IStrimExecFuncDataInput,
} from '../types'
import Strim from './Strim'
import { isObservable, Observable, of } from 'rxjs'

export const getDefaultEnv = () => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? Environment.Client
    : Environment.Server
}

export const splitToEnvironment = (
  items: IStrimExecFuncDataPiped[],
): IStrimExecFuncDataPiped[][] => {
  return items.reduce((splittedItems, currentItem) => {
    const lastItem =
      splittedItems[splittedItems.length - 1] &&
      splittedItems[splittedItems.length - 1][0]

    if (!lastItem || currentItem.env !== lastItem.env) {
      splittedItems.push([currentItem])
    } else {
      splittedItems[splittedItems.length - 1].push(currentItem)
    }

    return splittedItems
  }, [])
}

export const convertToPipeableFuncs = async (
  pipeItemsByEnvironment: IStrimExecFuncDataPiped[][],
) => {
  const pipeableFuncsByEnvironment = []

  for (const environmentalItems of pipeItemsByEnvironment) {
    const environmentalPipeableFunc = []

    for (const item of environmentalItems) {
      environmentalPipeableFunc.push(await getPipeableFunc(item))
    }

    pipeableFuncsByEnvironment.push(environmentalPipeableFunc)
  }

  return pipeableFuncsByEnvironment
}

const pipeableWrapper = (scope, func, args: any[] = []) => <T>(
  source: Observable<T>,
) =>
  new Observable<T>(observer => {
    return source.subscribe({
      next(x) {
        const result = func.apply(scope, [...args, x])

        if (isObservable(result)) {
          result.subscribe(observer)
        } else {
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

export const getPipeableFunc = async (
  execFuncData: IStrimExecFuncDataPiped,
) => {
  const { module, func, args } = execFuncData

  const src = await import(module)
  return pipeableWrapper(src, src[func], args)
}

// export const runStrimLocally = async (
//   currentComputedValue,
//   execFuncDatas: IStrimExecFuncData[],
// ) => {
//   let observable = of(currentComputedValue)
//
//   for (const execFuncData of execFuncDatas) {
//     const pipedFunc = await getPipedFunc(execFuncData)
//
//     // @ts-ignore
//     observable = observable.pipe(pipedFunc)
//   }
//
//   return observable
// }

export const convertToFullStrim = pipeableFuncsByEnvironment => {
  let observable = of(0)
  pipeableFuncsByEnvironment.forEach(environmentalPipeableFunc => {
    environmentalPipeableFunc.forEach(pipeableFunc => {
      observable = observable.pipe(pipeableFunc)
    })
    // TODO: switch environment operator
  })

  return observable
}
