import { IStrimExecFuncDataPiped, Environment } from '../types'
import { isObservable, Observable, of } from 'rxjs'
import { WebSocketSubject } from 'rxjs/webSocket'

// @ts-ignore
export const isBrowser = () => typeof __webpack_require__ === 'function'
// export const isNode = () =>

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

const hash = obj => JSON.stringify(obj)

const pipeableWsBridge = (wsSubject, pipeItems) => <T>(
  source: Observable<T>,
) => {
  const pipeItemsKey = hash(pipeItems)
  const wsObservable = wsSubject.multiplex(
    () => JSON.stringify({ subscribe: pipeItems }),
    () => JSON.stringify({ unsubscribe: pipeItemsKey }),
    message => message.type === pipeItemsKey,
  )

  return new Observable<T>(observer => {
    const wsSubscriber = wsObservable.subscribe({
      next(x) {
        observer.next(x)
      },
      error(err) {
        observer.error(err)
      },
      complete() {
        observer.complete()
      },
    })

    return source.subscribe({
      next(x) {
        console.log('wsSubscriber.next:', x)
        wsSubscriber.next(x)
      },
      error(err) {
        wsSubscriber.error(err)
      },
      complete() {
        wsSubscriber.unsubscribe()
        wsSubscriber.complete()
      },
    })
  })
}

export const getPipeableFunc = async (
  execFuncData: IStrimExecFuncDataPiped,
) => {
  const { module, func, args } = execFuncData

  if (isBrowser()) {
    // @ts-ignore
    const clientModule = window.strimClientModules[module]
    return pipeableWrapper(clientModule, clientModule[func], args)
  } else {
    const src = await import(module)
    return pipeableWrapper(src, src[func], args)
  }
}

export const convertToFullStrim = (
  pipeableFuncsByEnvironment: [[any?]?],
  webSocketSubject?: WebSocketSubject<any>,
) => {
  return pipeableFuncsByEnvironment.reduce(
    (observable, environmentalPipeableFunc, envIndex) => {
      if (
        envIndex !== 0 &&
        environmentalPipeableFunc[0].env !== Environment.Client
      ) {
        return observable.pipe(
          pipeableWsBridge(webSocketSubject, environmentalPipeableFunc),
        )
      }

      return environmentalPipeableFunc.reduce((subObservable, pipeableFunc) => {
        return subObservable.pipe(pipeableFunc)
      }, observable)
      // TODO: switch environment operator
    },
    of(undefined),
  )
}
