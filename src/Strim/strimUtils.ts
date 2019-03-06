import { IStrimExecFuncDataPiped, Environment } from '../types'
import { isObservable, Observable, of } from 'rxjs'
import { WebSocketSubject } from 'rxjs/webSocket'

export const isBrowser = new Function(
  'try {return this===window;}catch(e){ return false;}',
)
export const isNode = new Function(
  'try {return this===global;}catch(e){return false;}',
)

export const getDefaultEnv = () => {
  return isBrowser() ? Environment.Client : Environment.Server
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
): Promise<[[any?]?]> => {
  const pipeableFuncsByEnvironment: [[any?]?] = []

  for (const environmentalItems of pipeItemsByEnvironment) {
    const environmentalPipeableFunc: [any?] = []

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

export const convertToFullStrim = (
  pipeableFuncsByEnvironment: [[any?]?],
  webSocketSubject?: WebSocketSubject<any>,
) => {
  return pipeableFuncsByEnvironment.reduce(
    (observable, environmentalPipeableFunc, envIndex) => {
      let fullStrim = observable
      if (envIndex !== 0) {
        fullStrim = observable
      }

      return environmentalPipeableFunc.reduce((subObservable, pipeableFunc) => {
        return subObservable.pipe(pipeableFunc)
      }, fullStrim)
      // TODO: switch environment operator
    },
    of(undefined),
  )

  // let observable = of(undefined)
  // pipeableFuncsByEnvironment.forEach(environmentalPipeableFunc => {
  //   environmentalPipeableFunc.forEach(pipeableFunc => {
  //     observable = observable.pipe(pipeableFunc)
  //   })
  //   // TODO: switch environment operator
  // })

  // return observable
}
