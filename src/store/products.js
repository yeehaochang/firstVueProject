import axios from 'axios'
import Vue from 'vue'

export default {
  state: {
    products: [],
    favoProduct: [],
    favoNum: '',
    pagination: [],
    recentCategory: '',
    recentDesigner: '',
    sortValue: '',
    searchText: '',
    onsale: [],
    filterdata: {},
    categoryList: [],
    designerlist: []
  },
  actions: {
    // 取得商品列表方法(含分頁)
    getProducts (context, payload = 1) {
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/products?page=${payload}`
      context.commit('LOADING', true)
      // dispatch 傳入
      axios.get(api).then(response => {
        let newProd = response.data.products
        context.commit('FAVOPRODUCT', newProd)
        context.commit('CATEGORYLIST', newProd)
        context.commit('DESIGNERLIST', newProd)
        context.commit('PAGINATION', response.data.pagination)
        context.commit('PRODUCTS', newProd)
        context.commit('LOADING', false)
      })
    },
    //  取得過濾後產品列表方法
    getFilterProducts (context, payload) {
      //  參數為sidebar透過emit傳進的選定商品分類
      context.commit('RECENTCATEGORY', payload)
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/products/all`
      context.commit('LOADING', true)
      axios.get(api).then(response => {
        let newProd = response.data.products
        context.commit('FAVOPRODUCT', newProd)
        // 透過點擊傳進來的value篩選出商品分類結果
        if (payload !== '') {
          newProd = newProd.filter(function (item) {
            return item.category === payload
          })
        }
        let len = newProd.length
        // 寫入分頁
        let pagination = {
          current_page: 1,
          has_next: (len > 10),
          has_pre: false,
          total_pages: Math.floor((len - 1) / 10 + 1)
        }
        context.commit('PAGINATION', pagination)
        context.commit('PRODUCTS', newProd)
        context.commit('LOADING', false)
      })
    },
    removeProduct ({ commit, dispatch }, payload) {
      commit('LOADING', true)
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/admin/product/${payload}`
      axios.delete(api).then(response => {
        dispatch('getFilterProducts', '')
        commit('LOADING', false)
        dispatch('updateMessage', { message: response.data.message, status: 'correct' })
      })
    },
    getfilter (context, payload) {
      context.commit('FILTERDATA', payload)
    },
    sortType (context, payload) {
      if (payload === 'price') {
        context.commit('SORTVALUE', payload)
      } else {
        context.commit('SORTVALUE')
      }
    },
    addFavor (context, payload) {
      context.commit('FAVOPRODUCT', payload)
    },
    refresh (context) {
      context.commit('REFRESH')
    },
    getDesigner (context, payload) {
      context.commit('RECENTDESIGNER', payload)
    },
    showFavorite ({ commit, dispatch, state }) {
      commit('ISFAVORITE')
      dispatch('getFilterProducts', state.recentCategory)
    },
    removeCartProduct ({ commit, dispatch }, payload) {
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/cart/${payload}`
      commit('LOADING', true)
      axios.delete(api).then(response => {
        dispatch('getCart')
        commit('LOADING', false)
      })
    },
    // 移除過濾標籤
    removeDesigner ({ commit, dispatch, state }) {
      commit('RECENTDESIGNER', '')
      dispatch('getFilterProducts', state.recentCategory)
    },
    removeCategory ({ commit, dispatch, state }) {
      commit('RECENTCATEGORY', '')
      dispatch('getFilterProducts', state.recentCategory)
    },
    removeFilter ({ commit, dispatch, state }) {
      commit('FILTERDATA', [])
      dispatch('getFilterProducts', state.recentCategory)
    },
    removeSort ({ commit, dispatch, state }) {
      commit('SORTVALUE', '')
      dispatch('getFilterProducts', state.recentCategory)
    },
    removeSearchText ({ commit, dispatch, state }) {
      commit('SEARCHTEXT', '')
      dispatch('getFilterProducts', state.recentCategory)
    },
    getSearchText (context, payload) {
      context.commit('SEARCHTEXT', payload)
    },
    getFavorite (context) {
      let getlocal = JSON.parse(localStorage.getItem('myFavorite'))
      if (getlocal !== []) {
        context.commit('GETFAVORIT', getlocal)
      }
    }
  },
  mutations: {
    PRODUCTS (state, payload) {
      // 透過點擊傳進來的value篩選出商品分類結果
      let newArray = payload
      if (state.recentCategory !== '') {
        newArray = newArray.filter(function (item) {
          return item.category === state.recentCategory
        })
      }
      //   價格篩選過濾
      if (state.filterdata.maxprice) {
        newArray = newArray.filter(function (item) {
          return (
            parseInt(item.price) >= parseInt(state.filterdata.minprice) &&
            parseInt(item.price) < parseInt(state.filterdata.maxprice)
          )
        })
      }
      // 過濾搜尋關鍵字
      if (state.searchText !== '') {
        newArray = newArray.filter(function (item) {
          return item.title.match(state.searchText)
        })
      }
      // 過濾我的最愛
      if (state.isFavorite === true) {
        newArray = newArray.filter(function (item) {
          return item.isFavor === true
        })
      }
      //  過濾搜尋金額順序
      if (state.sortValue !== '' && state.sortValue === 'price') {
        newArray = newArray.sort(function (a, b) {
          return a.price - b.price
        })
      }
      //  過濾設計師
      if (state.recentDesigner !== '') {
        newArray = newArray.filter(function (item) {
          return item.description === state.recentDesigner
        })
      }
      //  set
      let stringdata = JSON.stringify(state.favoProduct)
      localStorage.setItem('myFavorite', stringdata)
      state.products = newArray
    },
    CATEGORYLIST (state, payload) {
      let newcategoryList = payload.map(function (item) {
        return item.category
      })
      state.categoryList = newcategoryList.filter(function (item, index, array) {
        return array.indexOf(item) === index
      })
    },
    DESIGNERLIST (state, payload) {
      let newdesignerList = payload.map(function (item) {
        return item.description
      })
      state.designerlist = newdesignerList.filter(function (item, index, array) {
        return array.indexOf(item) === index
      })
    },
    PAGINATION (state, payload) {
      state.pagination = Object.assign({}, payload)
    },
    FAVOPRODUCT (state, payload) {
      if (JSON.parse(localStorage.getItem('myFavorite')) === null) {
        state.favoProduct = []
      } else {
        state.favoProduct = JSON.parse(localStorage.getItem('myFavorite'))
        state.favoNum = state.favoProduct.length
      }
      //  若傳入為陣列，過濾出我的最愛的商品
      if (payload.length !== undefined) {
        payload.forEach((item) => {
          Vue.set(item, 'isFavor', false)
        })
        if (state.favoProduct !== []) {
          let titledata = state.favoProduct.map((item) => {
            return item.title
          })
          payload.forEach((item) => {
            if (titledata.includes(item.title)) {
              item.isFavor = true
            }
          })
        }
        state.onsale = payload.filter((item) => {
          return item.price !== item.origin_price
        })
      } else {
        //  若傳入單一物件，新增或刪除我的最愛
        if (payload.isFavor) {
          payload.isFavor = false
          state.favoProduct.forEach((item, index) => {
            if (payload.title === item.title) {
              state.favoProduct.splice(index, 1)
            }
          })
        } else {
          payload.isFavor = true
          state.favoProduct.push(payload)
          state.favoNum = state.favoProduct.length
        }
        let stringdata = JSON.stringify(state.favoProduct)
        localStorage.setItem('myFavorite', stringdata)
      }
      state.favoProduct = JSON.parse(localStorage.getItem('myFavorite'))
      state.favoNum = state.favoProduct.length
    },
    REFRESH (state) {
      state.recentCategory = ''
      state.recentDesigner = ''
      state.filterdata = {}
      state.sortValue = ''
      state.searchText = ''
    },
    SORTVALUE (state, payload) {
      state.sortValue = payload
    },
    RECENTCATEGORY (state, payload) {
      state.recentCategory = payload || ''
    },
    FILTERDATA (state, payload) {
      state.filterdata = payload || {}
    },
    ISFAVORITE (state) {
      state.isFavorite = !state.isFavorite
    },
    RECENTDESIGNER (state, payload) {
      state.recentDesigner = payload || ''
    },
    SEARCHTEXT (state, payload) {
      state.searchText = payload || ''
    },
    GETFAVORIT (state, payload) {
      state.favoProduct = payload
      state.favoNum = payload.length
    }
  },
  getters: {
    products: state => state.products,
    recentCategory: state => state.recentCategory,
    recentDesigner: state => state.recentDesigner,
    filterdata: state => state.filterdata,
    favoProduct: state => state.favoProduct,
    pagination: state => state.pagination,
    sortValue: state => state.sortValue,
    searchText: state => state.searchText,
    onsale: state => state.onsale,
    categoryList: state => state.categoryList,
    designerlist: state => state.designerlist
  }
}
