<template>
  <div>
    <loading :active.sync="isLoading"></loading>
    <table class="table bg-common text-general text-left mt-5">
      <thead class="bg-general text-common">
        <tr>
          <th>create_at</th>
          <th class="text-center">ID</th>
          <th class="text-center">是否付款</th>
          <th>備註訊息</th>
          <th class="text-center">編號</th>
          <th>訂單商品</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in orderList" :key="item.id">
          <td>{{item.create_at}}</td>
          <td class="text-center">{{item.id}}</td>
          <td class="text-center">{{item.is_paid}}</td>
          <td>{{item.message}}</td>
          <td class="text-center">{{item.num}}</td>
          <td>
            <ul class="list-group">
              <li
                class="list-group-item btn btn-outline-general"
                v-for="page in item.products"
                :key="page.id"
              >{{page.id}}</li>
            </ul>
          </td>
          <td>
            <a href="#" class="text-general" @click.prevent="openCheck(item)">
              <i class="fas fa-cog"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- modal -->
    <div
      class="modal fade"
      id="checkModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">修改訂單</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-row">
                <div class="col-md-5 mb-3">
                  <label for="create_at">create_at</label>
                  <input
                    v-model="tempCheck.create_at"
                    type="text"
                    class="form-control"
                    id="create_at"
                    placeholder="輸入新的code"
                    value
                    v-validate="'required'"
                    name="create_at"
                  />
                  <small class="text-danger" v-if="errors.has('create_at')">欄位不得為空</small>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="payment_method">payment_method</label>
                  <select
                    class="form-control"
                    id="payment_method"
                    v-model="tempCheck.payment_method"
                  >
                    <option>信用卡</option>
                    <option>轉帳</option>
                    <option>貨到付款</option>
                    <option>店到店</option>
                  </select>
                </div>
                <div class="col-3 d-flex align-items-center justify-content-center">
                  <div class="form-check">
                    <input
                      class="form-check-input d-flex"
                      type="checkbox"
                      value
                      id="is_paid"
                      v-model="tempCheck.is_paid"
                    />
                    <label class="form-check-label mx-auto" for="is_paid">is_paid</label>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="col-8 mb-3">
                  <label for="message">message</label>
                  <input
                    v-model="tempCheck.message"
                    type="text"
                    class="form-control"
                    id="message"
                    placeholder="請添加修改留言"
                    v-validate="'required'"
                    name="message"
                  />
                  <small class="text-danger" v-if="errors.has('message')">欄位不得為空</small>
                </div>
                <div class="col-4 mb-3">
                  <label for="total">total</label>
                  <input
                    type="number"
                    class="form-control"
                    id="total"
                    placeholder
                    v-validate="'required'"
                    v-model="tempCheck.total"
                    name="total"
                  />
                  <small class="text-danger" v-if="errors.has('total')">欄位不得為空</small>
                </div>

                <div class="border-top w-100 h4">收件人資料</div>

                <div class="mb-3">
                  <label for="address">地址 address</label>
                  <input
                    v-model="tempCheck.user.address"
                    type="text"
                    class="form-control"
                    id="address"
                    placeholder
                    v-validate="'required'"
                    name="address"
                  />
                  <small class="text-danger" v-if="errors.has('address')">欄位不得為空</small>
                </div>
                <div class="col-8 mb-3">
                  <label for="useremail">信箱 email</label>
                  <input
                    v-model="tempCheck.user.email"
                    type="mail"
                    class="form-control"
                    id="useremail"
                    placeholder
                    v-validate="'required|email'"
                    name="useremail"
                  />
                  <small class="text-danger" v-if="errors.has('useremail')">{{errors.first('useremail')}}</small>
                </div>
                <div class="col-4 mb-3">
                  <label for="username">姓名 name</label>
                  <input
                    v-model="tempCheck.user.name"
                    type="text"
                    class="form-control"
                    id="username"
                    placeholder
                    v-validate="'required'"
                    name="username"
                  />
                  <small class="text-danger" v-if="errors.has('username')">欄位不得為空</small>
                </div>
                <div class="mb-3">
                  <label for="usertel">連絡電話 tel</label>
                  <input
                    v-model="tempCheck.user.tel"
                    type="tel"
                    class="form-control"
                    id="usertel"
                    placeholder
                    v-validate="'required'"
                    name="usertel"
                  />
                  <small class="text-danger" v-if="errors.has('usertel')">欄位不得為空</small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-general" data-dismiss="modal">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              @click.prevent="updateCheck(tempCheck.id)"
            >確認送出</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  data () {
    return {
      tempCheck: {
        user: {}
      }
    }
  },
  methods: {
    getOrders (page = 1) {
      this.$store.dispatch('getOrders', page)
    },
    openCheck (item) {
      this.tempCheck = Object.assign({}, item)
      $('#checkModal').modal('show')
    },
    updateCheck (id) {
      const vm = this
      this.$store.dispatch('updateLoading', true)
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/admin/order/${id}`
      vm.$http.put(api, { data: vm.tempCheck }).then(response => {
        vm.tempCheck = {
          user: {}
        }
        $('#checkModal').modal('hide')
        vm.getOrders()
        this.$store.dispatch('updateLoading', false)
        this.$store.dispatch('updateMessage', { message: response.data.message, status: 'correct' })
      })
    }
  },
  computed: {
    orderList () {
      return this.$store.state.orderList
    },
    isLoading () {
      return this.$store.state.isLoading
    }
  },
  created () {
    this.getOrders()
  }
}
</script>

<style lang="scss" scoped>
label {
  display: flex;
  margin-right: auto;
}
</style>
