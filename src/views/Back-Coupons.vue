<template>
  <div>
    <loading :active.sync="isLoading"></loading>
      <a class="btn btn-general my-2" href="#" @click.prevent="openModal(true)">新增優惠券</a>
    <table class="table bg-common text-general text-left">
      <thead class="bg-general text-common">
        <tr>
          <th></th>
          <th>折扣碼 code</th>
          <th>due_date</th>
          <th>ID</th>
          <th class="text-correct text-center" width="100">啟用</th>
          <th class="text-center">編號</th>
          <th class="text-center">折扣數</th>
          <th>名稱</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in coupons" :key="item.id">
          <td>
            <a href="#" class="text-general" @click.prevent="removeCoupon(item.id)">
              <i class="fas fa-trash-alt"></i>
            </a>
          </td>
          <td>{{item.code}}</td>
          <td>{{item.due_date}}</td>
          <td>{{item.id}}</td>
          <th class="text-center">{{item.is_enabled}}</th>
          <th class="text-center">{{item.num}}</th>
          <th class="text-center">{{item.percent}}</th>
          <th>{{item.title}}</th>
          <th>
            <a
              href="#"
              class="text-general"
              @click.prevent="openModal(false,item)"
            >
              <i class="fas fa-cog"></i>修改
            </a>
          </th>
        </tr>
      </tbody>
    </table>

    <!-- 編輯優惠券modal -->
    <div
      class="modal fade"
      id="itemModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">編輯優惠券</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- 編輯表單 -->
            <form>
              <div class="form-row">
                <div class="form-group col-6">
                  <label for="Title">標題 Title</label>
                  <input
                    type="text"
                    class="form-control"
                    id="Title"
                    v-model="tempCoupon.title"
                    placeholder
                    v-validate="'required'"
                    name="Title"
                  />
                  <small class="text-danger" v-if="errors.has('Title')">此欄位不得為空</small>
                </div>
                <div class="form-group col-6">
                  <label for="code">折扣碼 code</label>
                  <input
                    type="text"
                    class="form-control"
                    id="code"
                    v-model="tempCoupon.code"
                    placeholder
                    v-validate="'required'"
                    name="code"
                  />
                  <small class="text-danger" v-if="errors.has('code')">此欄位不得為空</small>
                </div>
                <div class="form-group col-6 my-auto">
                  <input class="form-check-input" type="checkbox" v-model="tempCoupon.is_enabled" :true-value="1" :false-value="0" id="is_enabled"/>
                  <label class="form-check-label" for="is_enabled">是否啟用 is_enabled</label>
                </div>
                <div class="form-group col-6">
                  <label for="percent">折扣 percent</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="tempCoupon.percent"
                    id="percent"
                    placeholder
                    v-validate="'required'"
                    name="percent"
                  />
                  <small class="text-danger" v-if="errors.has('percent')">此欄位不得為空</small>
                </div>
                <div class="form-group">
                  <label for="due_date">due_date</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="tempCoupon.due_date"
                    id="due_date"
                    v-validate="'required'"
                    name="due_date"
                  />
                  <small class="text-danger" v-if="errors.has('due_date')">此欄位不得為空</small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-general" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click.prevent="updateEdit">儲存修改</button>
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
      tempCoupon: {},
      isNew: false
    }
  },
  methods: {
    getCoupons (page = 1) {
      this.$store.dispatch('getCoupons', page)
    },
    removeCoupon (id) {
      this.$store.dispatch('removeCoupon', id)
    },
    openModal (isNew, item) {
      // isNew確定為新增或修改
      // 並變更data的isNew判斷送出方式
      if (isNew) {
        this.tempCoupon = {}
        this.isNew = true
      } else {
        this.tempCoupon = Object.assign({}, item)
        // 避開傳參考特性
        this.isNew = false
      }
      $('#itemModal').modal('show')
    },
    updateEdit () {
      // 修改及送出方法
      const vm = this
      let api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/admin/coupon/${vm.tempCoupon.id}`
      let method = ''
      if (vm.isNew) {
        method = 'post'
        api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/admin/coupon`
      } else {
        method = 'put'
      }
      vm.$http[method](api, { data: vm.tempCoupon }).then(response => {
        vm.editItem = {}
        this.getCoupons()
        this.$store.dispatch('updateMessage', { message: response.data.message, status: 'correct' })
        $('#itemModal').modal('hide')
      })
    }
  },
  computed: {
    coupons () {
      return this.$store.state.coupons
    },
    isLoading () {
      return this.$store.state.isLoading
    }
  },
  created () {
    this.getCoupons()
  }
}
</script>
