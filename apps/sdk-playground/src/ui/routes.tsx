import { Redirect, Route, Switch } from 'wouter'
import FeaturePage from '@/ui/pages/feature'
import UIPage from '@/ui/pages/ui'

const Root = () => <Redirect to="/features/wallet-accounts" />

const Routes = () => {
  return (
    <Switch>
      <Route path="/" component={Root} />
      <Route path="/features/:name" component={FeaturePage} />
      <Route path="/features/:name/ui" component={UIPage} />
      <Route>404: No such page!</Route>
    </Switch>
  )
}

export default Routes
