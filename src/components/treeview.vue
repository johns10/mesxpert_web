
<script>
import { unsubscribeTags, createSubscription } from '../api/opc.js'
import treeview from './treeview.vue'
import VCheckbox from 'vuetify/es5/components/VCheckbox'
import VBtn from 'vuetify/es5/components/VBTn'
import VIcon from 'vuetify/es5/components/VIcon'
import VListTile from 'vuetify/es5/components/VList/VListTile.js'
import VList from 'vuetify/es5/components/VList/VList.js'
import { VListTileTitle, VListTileSubTitle, VListTileContent } from 'vuetify/es5/components/VList'
import VListTileAction from 'vuetify/es5/components/VList/VListTileAction'

export default {
  name: 'treeview',

  inheritAttrs: false,

  props: {
    captionField: {
      type: String,
      required: false,
      default: 'name'
    },
    checkbox: {
      type: Boolean,
      required: false,
      default: false
    },
    childrenField: {
      type: String,
      required: false,
      default: 'children'
    },
    expand: {
      type: Boolean,
      required: false,
      default: false
    },
    expandAll: {
      type: Boolean,
      required: false,
      default: false
    },
    expandedItems: {
      type: Array,
      required: false,
      default: () => []
    },
    iconField: {
      type: String,
      required: false,
      default: null
    },
    index: {
      type: Number,
      required: false,
      default: 0
    },
    items: {
      // if items is an Array it has no root, we generate only children
      type: [Object, Array, Function],
      required: true,
      default: () => {}
    },
    keyField: {
      type: String,
      required: false,
      default: 'node_id'
    },
    level: {
      type: Number,
      required: false,
      default: 0
    },
    loadingText: {
      type: String,
      required: false,
      default: 'Loading, please wait...'
    },
    // TODO: check if provide will work for only 1 level deep -- instead of prop
    parentSelected: {
      type: Boolean,
      required: false,
      default: false
    },
    root: {
      type: Boolean,
      required: false,
      default: false
    },
    select: {
      type: Boolean,
      required: false,
      default: false
    },
    toolbar: {
      type: Boolean,
      required: false,
      default: false
    },
    value: {
      type: Array,
      required: false,
      default: () => []
    }
  },

  created () {
    this.checkExpandChildren()
  },

  computed: {
    allDescendantLeafs () {
      let leafs = []
      let searchTree = items => {
        let children = this.getChildrenArray(items)
        if (children.length > 0) {
          // children.forEach(child => searchTree(child))
          for (let i = 0; i < children.length; i++) {
            searchTree(children[i])
          }
        } else {
          leafs.push(items)
        }
      }
      searchTree(this.items)
      return leafs
    },
    allDescendantLeafsSelected () {
      return this.value.includes(this.items[this.keyField]) || this.parentSelected ||
        (this.hasChildren && this.hasSelection &&
          (this.children.every(child => this.value.some(sel => sel === child[this.keyField])) ||
            this.allDescendantLeafs.every(leaf => this.value.some(sel => sel === leaf[this.keyField]))))
    },
    allDescendantParents () {
      let parents = []
      let searchTree = items => {
        let children = this.getChildrenArray(items)
        if (children.length > 0) {
          parents.push(items)
          // children.forEach(child => searchTree(child))
          for (let i = 0; i < children.length; i++) {
            searchTree(children[i])
          }
        }
      }
      searchTree(this.items)
      return parents
    },
    caption () {
      return this.items[this.captionField]
    },
    children () {
      return this.getChildrenArray(this.items)
    },
    data () {
      return this.items.value
    },
    expandable () {
      return this.expand || this.expandAll || this.hasChildren
    },
    hasChildren () {
      return (Array.isArray(this.items) && this.items.length > 0) || (!!this.items[this.childrenField] && Array.isArray(this.items[this.childrenField]) && this.items[this.childrenField].length > 0)
    },
    hasSelection () {
      return !!this.value && this.value.length > 0
    },
    indeterminate () {
      return this.hasSelection && this.hasChildren &&
        this.someDescendantLeafsSelected && !this.allDescendantLeafsSelected
    },
    isExpanded () {
      return this.expandedItems.indexOf(this.items[this.keyField]) > -1
    },
    leftPadding () {
      return (this.level * 24) + (this.expandable ? this.level * 24 : 0) -
        (this.expandable && this.level > 0 && (this.hasChildren) ? this.level * 24 + 4 : 0) -
        (this.expandable && this.level > 0 && !(this.hasChildren) ? this.level * 24 - 24 : 0) -
        (this.root ? 0 : 16)
    },
    node_class () {
      return this.items.node_class
    },
    someDescendantLeafsSelected () {
      return this.hasSelection &&
        (this.children.some(child => this.value.some(sel => sel === child[this.keyField])) ||
          this.allDescendantLeafs.some(leaf => this.value.some(sel => sel === leaf[this.keyField])))
    },
    selected () {
      return this.select && this.hasSelection && this.value[this.value.length - 1] === this.items[this.keyField]
    }
  },

  watch: {
    allDescendantLeafsSelected (newVal) {
      // we monitor if children are being clicked one-by-one
      // (prop is true but item.id is not in the list)
      // -> deselect children and push parent
      if (newVal && !this.value.includes(this.items[this.keyField]) && this.hasChildren && !this.parentSelected) {
        this.uncheckAllChildren()
        this.value.push(this.items[this.keyField])
      }
    }
  },

  methods: {
    checkExpandChildren () {
      if ((!this.expandable || this.expandAll || (!this.root && this.level === 0))) {
        if (!this.expandedItems.includes(this.items[this.keyField])) {
          this.expandedItems.push(this.items[this.keyField])
        }
      }
    },
    genExpandButton () {
      if (this.hasChildren && this.expandable) {
        return this.$createElement(VListTileAction, [
          this.$createElement(VBtn, {
            class: 'ma-0',
            props: {
              icon: true,
              small: true,
              right: true
            },
            on: {
              click: () => this.toggleExpandTree()
            }
          }, [this.genExpandIcon()])
        ])
      } else {
        return null
      }
    },
    genExpandIcon () {
      return this.$createElement(VIcon, {
        class: {
          expanded: this.isExpanded
        }
      }, ['keyboard_arrow_right'])
    },
    genCheckbox () {
      return this.$createElement(VListTileAction, [
        this.$createElement(VCheckbox, {
          class: 'ma-0',
          props: {
            hideDetails: true,
            // we set different behaviour if treeview has children or not
            inputValue: this.parentSelected || (this.hasChildren ? this.allDescendantLeafsSelected : this.value),
            value: this.parentSelected || (this.hasChildren ? this.allDescendantLeafsSelected : this.items[this.keyField]),
            indeterminate: this.indeterminate
          },
          on: {
            change: selection => {
              // we set different behaviour if treeview has children or not
              if (this.hasChildren) {
                if (this.allDescendantLeafsSelected) {
                  // deselect all
                  let ix = this.value.indexOf(this.items[this.keyField])
                  if (ix > -1) {
                    this.value.splice(ix, 1)
                  }
                  this.uncheckAllChildren()
                } else {
                  // select all -> push category
                  this.uncheckAllChildren()
                  this.value.push(this.items[this.keyField])
                }
              }
              if (this.parentSelected) {
                // this checkbox was checked only because of its parent
                // we need to remove parent from selection and add all siblings (except this item)
                this.$emit('uncheck', this.items[this.keyField])
              }
              if (this.parentSelected || this.hasChildren) {
                // nothing more to do
                this.$emit('input', this.value)
              } else {
                if (selection) {
                  this.$emit('input', selection)
                }
              }
            }
          }
        } /* , [
          this.$createElement('div', {
            slot: 'label'
          }, [this.genItemIcon(), this.caption])
        ] */)
      ])
    },
    genItemIcon () {
      if (this.iconField && this.items[this.iconField]) {
        return this.genIcon(this.items[this.iconField], 'ma-0')
      } else {
        return null
      }
    },
    genIcon (icon, classes, props) {
      return this.$createElement(VIcon, {
        class: classes,
        props: props
      }, [icon])
    },
    genRoot () {
      if (this.checkbox) {
        return this.$createElement(VListTile, {
          style: {
            'padding-left': this.leftPadding + 'px'
          },
          class: {
            // 'selected': this.selected,
            'root': true
          }
        }, (this.root || (this.checkbox && this.level >= 0)) ? [
          this.genCheckbox(),
          this.genRootLabel(),
          this.genToolbar()
        ] : [])
      } else {
        return this.$createElement(VListTile, {
          style: {
            'padding-left': this.leftPadding + 'px'
          },
          class: {
            'accent': this.selected,
            'selected': this.selected,
            'root': true
          }
        }, [
          this.genRootLabel(),
          this.genToolbar()
        ])
      }
    },
    genRootLabel () {
      return this.$createElement(VListTileContent, {}, [
        this.$createElement(VListTileTitle, {}, this.caption),
        this.$createElement(VListTileSubTitle, {}, this.data)
      ])
    },
    callCreateSubscription () {
      // console.log('calling create subscription')
      var clientId = this.$store.state.clientId
      var socket = this.$socket
      createSubscription(clientId, socket, this.items)
    },
    callUnsubscribeTags () {
      var clientId = this.$store.state.clientId
      var socket = this.$socket
      unsubscribeTags(clientId, socket, this.items)
    },
    genToolbar () {
      return [
        (this.hasChildren && this.expandable) ? this.genExpandButton() : [],
        this.$createElement(VListTileAction, [
          this.$createElement(VBtn, {
            class: ['ma-0', 'success'],
            props: {
              small: true,
              icon: true
            },
            on: {
              click: () => {
                this.callCreateSubscription()
              }
            }
          }, [this.genIcon('add', undefined, {small: true})])]),
        this.$createElement(VListTileAction, [
          this.$createElement(VBtn, {
            class: ['ma-0', 'error'],
            props: {
              small: true,
              icon: true
            },
            on: {
              click: () => {
                this.callUnsubscribeTags()
              }
            }
          }, [this.genIcon('remove', undefined, {small: true})])])
      ]
    },
    genChild (child, index) {
      return this.$createElement(treeview, {
        on: {
          input: selection => {
            this.$emit('input', selection)
          },
          uncheck: childId => {
            if (this.allDescendantLeafsSelected) {
              // push back all children except the given one
              for (let i = 0; i < this.children.length; i++) {
                if (this.children[i][this.keyField] !== childId) {
                  this.value.push(this.children[i][this.keyField])
                }
              }
            }
            // uncheck the child
            let cix = this.value.indexOf(childId)
            if (cix > -1) {
              this.value.splice(cix, 1)
            }
            // uncheck self
            let ix = this.value.indexOf(this.items[this.keyField])
            if (ix > -1) {
              this.value.splice(ix, 1)
            }
            // propagate up
            this.$emit('uncheck', this.items[this.keyField])
          }
        },
        props: {
          captionField: this.captionField,
          checkbox: this.checkbox,
          childrenField: this.childrenField,
          expand: this.expandable,
          expandAll: this.expandAll,
          expandedItems: this.expandedItems,
          iconField: this.iconField,
          index: this.index,
          items: child,
          keyField: this.keyField,
          level: this.level + 1,
          loadingText: this.loadingText,
          parentSelected: this.parentSelected || this.allDescendantLeafsSelected,
          root: this.root,
          select: this.select,
          value: this.value
        }
      })
    },
    genChildren () {
      let children = []
      if (this.hasChildren) {
        if (this.isExpanded) {
          let childElements = []
          // this.children.forEach((child, ix) => {
          //   childElements.push(this.genChild(child, ix))
          // })
          for (let i = 0; i < this.children.length; i++) {
            childElements.push(this.genChild(this.children[i], i))
          }
          const expand = this.$createElement('div', {
            class: 'treeview-content',
            // level + index as key
            key: `${this.level.toString()}/${this.index.toString()}`
          }, childElements)
          children.push(expand)
        }
        // TODO: something is not working as it should with transitions, commenting for now
        // const transition = this.$createElement('transition-group', {
        //   props: {
        //     tag: 'div'
        //   },
        //   on: ExpandTransitionGenerator()
        // }, children)
        const transition = this.$createElement('div', {}, children)
        return transition
      } else {
        return children
      }
    },
    getChildrenArray (items) {
      if (Array.isArray(items)) {
        return items
      } else if (!!items[this.childrenField] && Array.isArray(items[this.childrenField])) {
        return items[this.childrenField]
      } else {
        return []
      }
    },
    genLoadingLabel () {
      return this.$createElement('div', {
        style: {
          'padding-left': this.leftPadding + 64 + 'px'
        },
        class: {
          'accent': this.selected,
          'selected': this.selected,
          'd-flex': true,
          'root': true
        }
      }, [
        this.$createElement('div', {
          class: {
            'input-group': true,
            'checkbox': true,
            'input-group--hide-details': true,
            'input-group--selection-controls': true,
            'accent--text': true
          }
        }, [this.genIcon('cloud_download', ['accent--text', 'loading-pulse', 'mr-2']), this.loadingText])
      ])
    },
    spliceOne (arr, index) {
      let len = arr.length
      if (!len) {
        return
      }
      while (index < len) {
        arr[index] = arr[index + 1]
        index++
      }
      // arr.length--
      // need to notify vue that array has been changed!
      arr.pop()
    },
    async toggleExpandTree () {
      let ix = this.expandedItems.indexOf(this.items[this.keyField])
      if (ix > -1) {
        this.expandedItems.splice(ix, 1)
      } else {
        this.expandedItems.push(this.items[this.keyField])
      }
    },
    toggleSelected () {
      if (this.select) {
        let ix = this.value.indexOf(this.items[this.keyField])
        this.value.splice(0, this.value.length)
        if (ix === -1) {
          this.value.push(this.items[this.keyField])
        }
        this.$emit('input', this.value)
      }
    },
    uncheckAllChildren () {
      for (let i = 0; i < this.allDescendantLeafs.length; i++) {
        let ix = this.value.indexOf(this.allDescendantLeafs[i][this.keyField])
        if (ix > -1) {
          this.spliceOne(this.value, ix)
        }
      }
      for (let i = 0; i < this.children.length; i++) {
        let ix = this.value.indexOf(this.children[i][this.keyField])
        if (ix > -1) {
          this.spliceOne(this.value, ix)
        }
      }
    }
  },

  render (createElement) {
    return createElement(VList, {
    }, [this.genRoot(), this.genChildren()])
  }

}
</script>
<style scoped> .v-list__tile__action--stack: initial </style>
