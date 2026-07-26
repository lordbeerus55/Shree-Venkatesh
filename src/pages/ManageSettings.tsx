import { useState, useEffect } from 'react'
import { settingsApi } from '../lib/api'

export default function ManageSettings() {
  const [homescreenText, setHomescreenText] = useState('')
  const [newRegistration, setNewRegistration] = useState('1')
  const [landingPage, setLandingPage] = useState('0')
  const [signupReward, setSignupReward] = useState('0')
  const [minDeposit, setMinDeposit] = useState('200')
  const [minWithdraw, setMinWithdraw] = useState('500')
  const [maxWithdraw, setMaxWithdraw] = useState('100000')
  const [minBet, setMinBet] = useState('5')
  const [maxBet, setMaxBet] = useState('20000')
  const [shareLink, setShareLink] = useState('')
  const [withdrawVideoLink, setWithdrawVideoLink] = useState('')
  const [starlineEnable, setStarlineEnable] = useState('0')
  const [delhiEnable, setDelhiEnable] = useState('0')
  const [withdrawDisable, setWithdrawDisable] = useState('0')
  const [withdrawDisableMsg, setWithdrawDisableMsg] = useState('')
  const [withdrawMsg, setWithdrawMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    settingsApi.list().then((s) => {
      if (s.homescreen_text) setHomescreenText(s.homescreen_text)
      if (s.new_registration) setNewRegistration(s.new_registration)
      if (s.landing_page) setLandingPage(s.landing_page)
      if (s.signup_reward) setSignupReward(s.signup_reward)
      if (s.min_deposit) setMinDeposit(s.min_deposit)
      if (s.min_withdraw) setMinWithdraw(s.min_withdraw)
      if (s.max_withdraw) setMaxWithdraw(s.max_withdraw)
      if (s.min_bet) setMinBet(s.min_bet)
      if (s.max_bet) setMaxBet(s.max_bet)
      if (s.share_link) setShareLink(s.share_link)
      if (s.withdraw_video_link) setWithdrawVideoLink(s.withdraw_video_link)
      if (s.starline_enable) setStarlineEnable(s.starline_enable)
      if (s.delhi_enable) setDelhiEnable(s.delhi_enable)
      if (s.withdraw_disable) setWithdrawDisable(s.withdraw_disable)
      if (s.withdraw_disable_msg) setWithdrawDisableMsg(s.withdraw_disable_msg)
      if (s.withdraw_msg) setWithdrawMsg(s.withdraw_msg)
    }).catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Main Settings</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Main Settings</h3>
        </div>
        <div className="p-4 max-w-2xl">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setSubmitting(true); setMsg('')
              await settingsApi.update({
                homescreen_text: homescreenText, new_registration: newRegistration, landing_page: landingPage,
                signup_reward: signupReward, min_deposit: minDeposit, min_withdraw: minWithdraw,
                max_withdraw: maxWithdraw, min_bet: minBet, max_bet: maxBet, share_link: shareLink,
                withdraw_video_link: withdrawVideoLink, starline_enable: starlineEnable, delhi_enable: delhiEnable,
                withdraw_disable: withdrawDisable, withdraw_disable_msg: withdrawDisableMsg, withdraw_msg: withdrawMsg,
              }).then(() => setMsg('Settings updated')).catch((err) => alert(err.message))
              setSubmitting(false)
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="homescreen_text" className="block text-sm font-medium text-gray-700 mb-1">Homescreen text</label>
              <input type="text" id="homescreen_text" value={homescreenText} onChange={(e) => setHomescreenText(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="new_registration" className="block text-sm font-medium text-gray-700 mb-1">New registration</label>
              <input type="text" id="new_registration" value={newRegistration} onChange={(e) => setNewRegistration(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="landing_page" className="block text-sm font-medium text-gray-700 mb-1">Landing page</label>
              <input type="text" id="landing_page" value={landingPage} onChange={(e) => setLandingPage(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="signup_reward" className="block text-sm font-medium text-gray-700 mb-1">Signup reward</label>
              <input type="text" id="signup_reward" value={signupReward} onChange={(e) => setSignupReward(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="min_deposit" className="block text-sm font-medium text-gray-700 mb-1">Min deposit</label>
              <input type="text" id="min_deposit" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="min_withdraw" className="block text-sm font-medium text-gray-700 mb-1">Min withdraw</label>
              <input type="text" id="min_withdraw" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="max_withdraw" className="block text-sm font-medium text-gray-700 mb-1">Max withdraw</label>
              <input type="text" id="max_withdraw" value={maxWithdraw} onChange={(e) => setMaxWithdraw(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="min_bet" className="block text-sm font-medium text-gray-700 mb-1">Min bet</label>
              <input type="text" id="min_bet" value={minBet} onChange={(e) => setMinBet(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="max_bet" className="block text-sm font-medium text-gray-700 mb-1">Max bet</label>
              <input type="text" id="max_bet" value={maxBet} onChange={(e) => setMaxBet(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="share_link" className="block text-sm font-medium text-gray-700 mb-1">Share link</label>
              <input type="text" id="share_link" value={shareLink} onChange={(e) => setShareLink(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="withdraw_video_link" className="block text-sm font-medium text-gray-700 mb-1">Withdraw video link</label>
              <input type="text" id="withdraw_video_link" value={withdrawVideoLink} onChange={(e) => setWithdrawVideoLink(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="starline_enable" className="block text-sm font-medium text-gray-700 mb-1">Starline enable</label>
              <select id="starline_enable" value={starlineEnable} onChange={(e) => setStarlineEnable(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </select>
            </div>
            <div>
              <label htmlFor="delhi_enable" className="block text-sm font-medium text-gray-700 mb-1">Delhi enable</label>
              <select id="delhi_enable" value={delhiEnable} onChange={(e) => setDelhiEnable(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </select>
            </div>
            <div>
              <label htmlFor="withdraw_disable" className="block text-sm font-medium text-gray-700 mb-1">Withdraw disable</label>
              <select id="withdraw_disable" value={withdrawDisable} onChange={(e) => setWithdrawDisable(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </select>
            </div>
            <div>
              <label htmlFor="withdraw_disable_msg" className="block text-sm font-medium text-gray-700 mb-1">Withdraw disable msg</label>
              <input type="text" id="withdraw_disable_msg" value={withdrawDisableMsg} onChange={(e) => setWithdrawDisableMsg(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label htmlFor="withdraw_msg" className="block text-sm font-medium text-gray-700 mb-1">Withdraw msg</label>
              <input type="text" id="withdraw_msg" value={withdrawMsg} onChange={(e) => setWithdrawMsg(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">{submitting ? 'Updating…' : 'Update'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
