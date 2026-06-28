import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, ArrowRight, Eye, RefreshCw, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import './DataStructuresVisualizer.css';

// Audio Context Helper
let audioCtx = null;
const playDSTone = (val, maxVal = 100) => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const freq = 200 + (val / maxVal) * 600;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    console.error('Audio playback error', e);
  }
};

// Unique node ID generator for Linked List / BST
let nodeUniqueId = 0;

const DataStructuresVisualizer = ({ activeTab }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [complexityInfo, setComplexityInfo] = useState({
    operation: 'Select an operation',
    time: '-',
    space: '-',
    desc: 'Perform an operation to view its time and space complexities.'
  });
  const [statusMessage, setStatusMessage] = useState(null); // { text: '', type: 'info' | 'success' | 'warning' | 'error' }

  // Clear status message when active Tab changes
  useEffect(() => {
    setStatusMessage(null);
  }, [activeTab]);

  // Global inputs
  const [valInput, setValInput] = useState('');
  const [idxInput, setIdxInput] = useState('');

  // 1. Stack State
  const [stack, setStack] = useState([15, 42, 78]);
  const [stackActive, setStackActive] = useState(null); // { idx: number, type: 'push' | 'pop' | 'peek' }

  // 2. Queue State
  const [queue, setQueue] = useState([23, 67, 89]);
  const [queueActive, setQueueActive] = useState(null); // { idx: number, type: 'enqueue' | 'dequeue' | 'peek' }

  // 3. Array State
  const [arr, setArr] = useState([12, 34, 45, 56, 78, 90, 99]);
  const [arrActive, setArrActive] = useState(null); // { indices: [], type: 'compare' | 'swap' | 'found' }

  // 4. Linked List State
  const [list, setList] = useState([
    { id: ++nodeUniqueId, val: 10 },
    { id: ++nodeUniqueId, val: 20 },
    { id: ++nodeUniqueId, val: 30 }
  ]);
  const [listActive, setListActive] = useState(null); // node.id
  const [arrowCoords, setArrowCoords] = useState([]);
  const listContainerRef = useRef(null);

  // 5. BST State
  const [bstRoot, setBstRoot] = useState(null);
  const [bstActive, setBstActive] = useState(null); // node value
  const [bstLines, setBstLines] = useState([]);
  const bstContainerRef = useRef(null);

  // Initialize default BST
  useEffect(() => {
    // Initial BST: root 50, left 30, right 70, left-left 20, left-right 40
    let root = { value: 50, id: ++nodeUniqueId, left: null, right: null };
    root = insertNodeBST(root, 30);
    root = insertNodeBST(root, 70);
    root = insertNodeBST(root, 20);
    root = insertNodeBST(root, 40);
    setBstRoot(root);
  }, []);

  // Recalculate Linked List SVG Arrows
  useEffect(() => {
    if (activeTab === 'linkedlist') {
      calculateListArrows();
      window.addEventListener('resize', calculateListArrows);
    } else {
      window.removeEventListener('resize', calculateListArrows);
    }
    return () => window.removeEventListener('resize', calculateListArrows);
  }, [list, activeTab]);

  // Recalculate BST SVG Connecting lines
  useEffect(() => {
    if (activeTab === 'bst' && bstRoot) {
      calculateBSTLines();
      window.addEventListener('resize', calculateBSTLines);
    } else {
      window.removeEventListener('resize', calculateBSTLines);
    }
    return () => window.removeEventListener('resize', calculateBSTLines);
  }, [bstRoot, activeTab]);

  // General audio trigger helper
  const triggerAudio = (val) => {
    if (soundEnabled) playDSTone(val);
  };

  // ==================== STACK OPERATIONS ====================
  const handlePush = () => {
    setComplexityInfo({
      operation: 'Push',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Adds an element directly onto the top of the stack. Direct memory index allocation.'
    });

    if (stack.length >= 6) {
      setStatusMessage({
        text: 'Stack Overflow! Stack has reached its capacity limit of 6 elements.',
        type: 'error'
      });
      return;
    }
    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    triggerAudio(num);
    const newStack = [...stack, num];
    setStack(newStack);
    setStackActive({ idx: newStack.length - 1, type: 'push' });
    setValInput('');
    setStatusMessage({
      text: `Successfully pushed value ${num} onto the Stack!`,
      type: 'success'
    });

    setTimeout(() => setStackActive(null), 500);
  };

  const handlePop = () => {
    setComplexityInfo({
      operation: 'Pop',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Removes and returns the element at the top of the stack. Direct pointer updates.'
    });

    if (stack.length === 0) {
      setStatusMessage({
        text: 'Stack Underflow! Cannot pop from an empty stack.',
        type: 'error'
      });
      return;
    }
    const poppedVal = stack[stack.length - 1];
    triggerAudio(poppedVal);

    setStackActive({ idx: stack.length - 1, type: 'pop' });
    setStatusMessage({
      text: `Successfully popped value ${poppedVal} from the Stack!`,
      type: 'success'
    });
    setTimeout(() => {
      setStack(stack.slice(0, -1));
      setStackActive(null);
    }, 350);
  };

  const handlePeekStack = () => {
    setComplexityInfo({
      operation: 'Peek / Top',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Inspects the top element without removing it.'
    });

    if (stack.length === 0) {
      setStatusMessage({
        text: 'Stack is empty! Nothing to peek.',
        type: 'warning'
      });
      return;
    }
    const peekedVal = stack[stack.length - 1];
    triggerAudio(peekedVal);

    setStackActive({ idx: stack.length - 1, type: 'peek' });
    setStatusMessage({
      text: `Peek: Top element is ${peekedVal}`,
      type: 'info'
    });
    setTimeout(() => setStackActive(null), 1000);
  };

  const handleIsEmptyStack = () => {
    setComplexityInfo({
      operation: 'isEmpty',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Checks if the stack is empty by comparing its size to 0.'
    });
    const empty = stack.length === 0;
    setStatusMessage({
      text: `isEmpty: ${empty ? 'True (Stack is Empty)' : 'False (Stack has elements)'}`,
      type: empty ? 'warning' : 'success'
    });
  };

  const handleIsFullStack = () => {
    setComplexityInfo({
      operation: 'isFull',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Checks if stack has reached its fixed implementation capacity (6).'
    });
    const full = stack.length >= 6;
    setStatusMessage({
      text: `isFull: ${full ? 'True (Stack is Full)' : 'False (Stack has remaining capacity)'}`,
      type: full ? 'error' : 'success'
    });
  };

  const handleSearchStack = async () => {
    setComplexityInfo({
      operation: 'Search (Stack)',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Scans stack elements one-by-one from Top to bottom to find a match.'
    });

    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;
    setValInput('');
    setStatusMessage({
      text: `Searching stack for value ${num}...`,
      type: 'info'
    });

    let foundIdx = -1;
    for (let i = stack.length - 1; i >= 0; i--) {
      setStackActive({ idx: i, type: 'peek' });
      triggerAudio(stack[i]);
      await new Promise(r => setTimeout(r, 450));
      if (stack[i] === num) {
        foundIdx = i;
        triggerAudio(100);
        setStackActive({ idx: i, type: 'peek' });
        await new Promise(r => setTimeout(r, 800));
        break;
      }
    }
    setStackActive(null);
    if (foundIdx !== -1) {
      setStatusMessage({
        text: `Found value ${num} at index ${foundIdx} (position ${stack.length - foundIdx - 1} from Top)!`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Value ${num} not found in stack.`,
        type: 'error'
      });
    }
  };

  const handleClearStack = () => {
    setComplexityInfo({
      operation: 'Clear Stack',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Resets the stack elements to empty.'
    });
    setStack([]);
    setStackActive(null);
    setStatusMessage({
      text: 'Stack cleared successfully.',
      type: 'info'
    });
  };

  // ==================== QUEUE OPERATIONS ====================
  const handleEnqueue = () => {
    setComplexityInfo({
      operation: 'Enqueue',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Adds an element directly to the back (Rear) of the queue. O(1) pointer assignment.'
    });

    if (queue.length >= 6) {
      setStatusMessage({
        text: 'Queue Overflow! Queue has reached its capacity limit of 6 elements.',
        type: 'error'
      });
      return;
    }
    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    triggerAudio(num);
    const newQueue = [...queue, num];
    setQueue(newQueue);
    setQueueActive({ idx: newQueue.length - 1, type: 'enqueue' });
    setValInput('');
    setStatusMessage({
      text: `Successfully enqueued value ${num} to the Queue!`,
      type: 'success'
    });

    setTimeout(() => setQueueActive(null), 500);
  };

  const handleDequeue = () => {
    setComplexityInfo({
      operation: 'Dequeue',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Removes and returns the front element (Head). Under the hood, memory pointers are shifted in O(1).'
    });

    if (queue.length === 0) {
      setStatusMessage({
        text: 'Queue Underflow! Cannot dequeue from an empty queue.',
        type: 'error'
      });
      return;
    }
    const dequeuedVal = queue[0];
    triggerAudio(dequeuedVal);

    setQueueActive({ idx: 0, type: 'dequeue' });
    setStatusMessage({
      text: `Successfully dequeued value ${dequeuedVal} from the Queue!`,
      type: 'success'
    });
    setTimeout(() => {
      setQueue(queue.slice(1));
      setQueueActive(null);
    }, 350);
  };

  const handlePeekQueue = () => {
    setComplexityInfo({
      operation: 'Peek / Front',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Inspects the front-most element in the queue (the next in line to dequeue) without removing it.'
    });

    if (queue.length === 0) {
      setStatusMessage({
        text: 'Queue is empty! Nothing to peek.',
        type: 'warning'
      });
      return;
    }
    const peekedVal = queue[0];
    triggerAudio(peekedVal);

    setQueueActive({ idx: 0, type: 'peek' });
    setStatusMessage({
      text: `Peek Front: Front element is ${peekedVal}`,
      type: 'info'
    });
    setTimeout(() => setQueueActive(null), 1000);
  };

  const handlePeekRearQueue = () => {
    setComplexityInfo({
      operation: 'Peek / Rear (Back)',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Inspects the last element in the queue (Rear) without removing it.'
    });

    if (queue.length === 0) {
      setStatusMessage({
        text: 'Queue is empty! Nothing to peek.',
        type: 'warning'
      });
      return;
    }
    const peekedVal = queue[queue.length - 1];
    triggerAudio(peekedVal);

    setQueueActive({ idx: queue.length - 1, type: 'peek' });
    setStatusMessage({
      text: `Peek Rear: Rear element is ${peekedVal}`,
      type: 'info'
    });
    setTimeout(() => setQueueActive(null), 1000);
  };

  const handleIsEmptyQueue = () => {
    setComplexityInfo({
      operation: 'isEmpty (Queue)',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Checks if the queue size equals 0.'
    });
    const empty = queue.length === 0;
    setStatusMessage({
      text: `isEmpty: ${empty ? 'True (Queue is Empty)' : 'False (Queue has elements)'}`,
      type: empty ? 'warning' : 'success'
    });
  };

  const handleSearchQueue = async () => {
    setComplexityInfo({
      operation: 'Search (Queue)',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Traverses and scans elements frame by frame from Front to Rear.'
    });

    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;
    setValInput('');
    setStatusMessage({
      text: `Searching queue for value ${num}...`,
      type: 'info'
    });

    let foundIdx = -1;
    for (let i = 0; i < queue.length; i++) {
      setQueueActive({ idx: i, type: 'peek' });
      triggerAudio(queue[i]);
      await new Promise(r => setTimeout(r, 450));
      if (queue[i] === num) {
        foundIdx = i;
        triggerAudio(100);
        setQueueActive({ idx: i, type: 'peek' });
        await new Promise(r => setTimeout(r, 800));
        break;
      }
    }
    setQueueActive(null);
    if (foundIdx !== -1) {
      setStatusMessage({
        text: `Found value ${num} at index ${foundIdx} (position ${foundIdx} from Front/Exit)!`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Value ${num} not found in queue.`,
        type: 'error'
      });
    }
  };

  const handleClearQueue = () => {
    setComplexityInfo({
      operation: 'Clear Queue',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Clears queue contents.'
    });
    setQueue([]);
    setQueueActive(null);
    setStatusMessage({
      text: 'Queue cleared successfully.',
      type: 'info'
    });
  };

  // ==================== ARRAY OPERATIONS ====================
  const handleLookupArray = () => {
    setComplexityInfo({
      operation: 'Access / Lookup (arr[i])',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Directly reads or modifies an element at a specific index using direct memory offset lookup.'
    });

    const idx = parseInt(idxInput);
    if (isNaN(idx) || idx < 0 || idx >= arr.length) {
      setStatusMessage({
        text: `Please enter a valid index (0-${arr.length - 1}) to access!`,
        type: 'error'
      });
      return;
    }
    setIdxInput('');

    triggerAudio(arr[idx]);
    setArrActive({ indices: [idx], type: 'found' });
    setStatusMessage({
      text: `Access/Lookup: Element at index ${idx} is ${arr[idx]}`,
      type: 'success'
    });
    setTimeout(() => {
      setArrActive(null);
    }, 600);
  };

  const handleInsertArray = () => {
    setComplexityInfo({
      operation: 'Insertion',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Adding an element. If inserting at the end, it is O(1); if inserting at beginning/middle, subsequent elements must shift.'
    });

    const num = parseInt(valInput);
    const idx = parseInt(idxInput);
    if (isNaN(num)) return;
    
    let targetIdx = idx;
    if (isNaN(idx) || idx < 0 || idx > arr.length) {
      targetIdx = arr.length;
    }

    triggerAudio(num);
    const newArr = [...arr];
    newArr.splice(targetIdx, 0, num);

    setArrActive({ indices: [targetIdx], type: 'swap' });
    setStatusMessage({
      text: `Successfully inserted value ${num} at index ${targetIdx}!`,
      type: 'success'
    });
    setTimeout(() => {
      setArr(newArr);
      setArrActive(null);
      setValInput('');
      setIdxInput('');
    }, 300);
  };

  const handleDeleteArray = () => {
    setComplexityInfo({
      operation: 'Deletion',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Removing an element from array. Requires shifting elements to fill the gap left by deleted item.'
    });

    const idx = parseInt(idxInput);
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return;

    const val = arr[idx];
    triggerAudio(val);
    setArrActive({ indices: [idx], type: 'swap' });
    setStatusMessage({
      text: `Successfully deleted value ${val} at index ${idx}!`,
      type: 'success'
    });
    
    setTimeout(() => {
      const newArr = [...arr];
      newArr.splice(idx, 1);
      setArr(newArr);
      setArrActive(null);
      setIdxInput('');
    }, 300);
  };

  const handleUpdateArray = () => {
    setComplexityInfo({
      operation: 'Update Index',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Directly reads and overrides value at index.'
    });

    const num = parseInt(valInput);
    const idx = parseInt(idxInput);
    if (isNaN(num) || isNaN(idx) || idx < 0 || idx >= arr.length) return;

    triggerAudio(num);
    const newArr = [...arr];
    newArr[idx] = num;
    setArrActive({ indices: [idx], type: 'swap' });
    setStatusMessage({
      text: `Successfully updated index ${idx} to value ${num}!`,
      type: 'success'
    });
    setTimeout(() => {
      setArr(newArr);
      setArrActive(null);
      setValInput('');
      setIdxInput('');
    }, 300);
  };

  const handleSearchArray = async () => {
    setComplexityInfo({
      operation: 'Search (Linear)',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Scanning through the array to find a specific value.'
    });

    const num = parseInt(valInput);
    if (isNaN(num)) return;
    setValInput('');
    setStatusMessage({
      text: `Linearly searching array for value ${num}...`,
      type: 'info'
    });

    let foundIdx = -1;
    for (let i = 0; i < arr.length; i++) {
      setArrActive({ indices: [i], type: 'compare' });
      triggerAudio(arr[i]);
      await new Promise(r => setTimeout(r, 400));
      
      if (arr[i] === num) {
        foundIdx = i;
        setArrActive({ indices: [i], type: 'found' });
        triggerAudio(100);
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }

    setArrActive(null);
    if (foundIdx !== -1) {
      setStatusMessage({
        text: `Found value ${num} at index ${foundIdx}!`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Value ${num} not found in array!`,
        type: 'error'
      });
    }
  };

  const handleBinarySearchArray = async () => {
    setComplexityInfo({
      operation: 'Search (Binary)',
      time: 'O(log n) - Logarithmic Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Finding a value in a sorted array by repeatedly dividing the search interval in half.'
    });

    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;
    setValInput('');

    const sorted = [...arr].sort((a, b) => a - b);
    setArr(sorted);
    setStatusMessage({
      text: 'Array sorted automatically to satisfy Binary Search conditions!',
      type: 'warning'
    });
    await new Promise(r => setTimeout(r, 1000));

    let low = 0;
    let high = sorted.length - 1;
    let foundIdx = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      setArrActive({ indices: [mid], low, high, mid, type: 'compare' });
      triggerAudio(sorted[mid]);
      setStatusMessage({
        text: `Searching between indices ${low} and ${high}. Pivot Midpoint index is ${mid}.`,
        type: 'info'
      });
      await new Promise(r => setTimeout(r, 800));

      if (sorted[mid] === num) {
        foundIdx = mid;
        setArrActive({ indices: [mid], low, high, mid, type: 'found' });
        triggerAudio(100);
        await new Promise(r => setTimeout(r, 1000));
        break;
      } else if (sorted[mid] < num) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    setArrActive(null);
    if (foundIdx !== -1) {
      setStatusMessage({
        text: `Found value ${num} at sorted index ${foundIdx}!`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Value ${num} not found in array.`,
        type: 'error'
      });
    }
  };

  const handleClearArray = () => {
    setComplexityInfo({
      operation: 'Clear Array',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Empties the array contents.'
    });
    setArr([]);
    setArrActive(null);
    setStatusMessage({
      text: 'Array cleared successfully.',
      type: 'info'
    });
  };

  // ==================== LINKED LIST OPERATIONS ====================
  const calculateListArrows = () => {
    if (!listContainerRef.current) return;
    const parent = listContainerRef.current;
    const nodes = parent.querySelectorAll('.list-node');
    const coords = [];

    for (let i = 0; i < nodes.length - 1; i++) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];

      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      const x1 = fromRect.right - parentRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - parentRect.top;

      const x2 = toRect.left - parentRect.left;
      const y2 = toRect.top + toRect.height / 2 - parentRect.top;

      coords.push({ x1, y1, x2, y2, fromId: list[i].id });
    }
    setArrowCoords(coords);
  };

  const handleInsertListHead = () => {
    setComplexityInfo({
      operation: 'Insert at Head',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Adding a node to the very beginning. Instant reference update.'
    });

    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    triggerAudio(num);
    const newId = ++nodeUniqueId;
    setList([{ id: newId, val: num }, ...list]);
    setListActive(newId);
    setValInput('');
    setTimeout(() => setListActive(null), 600);
  };

  const handleInsertListTail = () => {
    setComplexityInfo({
      operation: 'Insert at Tail',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Adding a node to the very end of list. Instant O(1) assuming tail pointer is kept.'
    });

    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    triggerAudio(num);
    const newId = ++nodeUniqueId;
    setList([...list, { id: newId, val: num }]);
    setListActive(newId);
    setValInput('');
    setTimeout(() => setListActive(null), 600);
  };

  const handleInsertListAtIndex = async () => {
    setComplexityInfo({
      operation: 'Insert in Middle',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Finding the spot takes linear time O(n), though actual pointer link change is constant O(1).'
    });

    if (!valInput || !idxInput) return;
    const num = parseInt(valInput);
    const idx = parseInt(idxInput);
    if (isNaN(num) || isNaN(idx) || idx < 0 || idx > list.length) return;
    setValInput('');
    setIdxInput('');

    if (idx === 0) {
      triggerAudio(num);
      const newId = ++nodeUniqueId;
      setList([{ id: newId, val: num }, ...list]);
      setListActive(newId);
      setTimeout(() => setListActive(null), 600);
      return;
    }

    for (let i = 0; i < idx; i++) {
      setListActive(list[i].id);
      triggerAudio(list[i].val);
      await new Promise(r => setTimeout(r, 450));
    }

    const newId = ++nodeUniqueId;
    const newList = [...list];
    newList.splice(idx, 0, { id: newId, val: num });
    setList(newList);
    setListActive(newId);
    triggerAudio(num);
    setTimeout(() => setListActive(null), 600);
  };

  const handleDeleteListHead = () => {
    setComplexityInfo({
      operation: 'Delete Head',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Removing the first node immediately.'
    });

    if (list.length === 0) return;
    triggerAudio(list[0].val);
    setListActive(list[0].id);

    setTimeout(() => {
      setList(list.slice(1));
      setListActive(null);
    }, 300);
  };

  const handleDeleteListTail = async () => {
    setComplexityInfo({
      operation: 'Delete Tail / Node',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'For singly list, must traverse to end O(n) to find predecessor and unlink tail node.'
    });

    if (list.length === 0) return;
    
    for (let i = 0; i < list.length; i++) {
      setListActive(list[i].id);
      triggerAudio(list[i].val);
      await new Promise(r => setTimeout(r, 300));
    }

    setTimeout(() => {
      setList(list.slice(0, -1));
      setListActive(null);
    }, 200);
  };

  const handleDeleteListAtIndex = async () => {
    setComplexityInfo({
      operation: 'Delete Tail / Node (at index)',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Traverses to predecessor index O(n), then performs O(1) unlinking.'
    });

    if (!idxInput) return;
    const idx = parseInt(idxInput);
    if (isNaN(idx) || idx < 0 || idx >= list.length) return;
    setIdxInput('');

    for (let i = 0; i <= idx; i++) {
      setListActive(list[i].id);
      triggerAudio(list[i].val);
      await new Promise(r => setTimeout(r, 450));
    }

    setTimeout(() => {
      const newList = [...list];
      newList.splice(idx, 1);
      setList(newList);
      setListActive(null);
    }, 200);
  };

  const handleSearchList = async () => {
    setComplexityInfo({
      operation: 'Traverse / Search',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Walking through the list sequentially from head to find the element.'
    });

    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;
    setValInput('');
    setStatusMessage({
      text: `Searching linked list for value ${num}...`,
      type: 'info'
    });

    let foundId = null;
    for (let i = 0; i < list.length; i++) {
      setListActive(list[i].id);
      triggerAudio(list[i].val);
      await new Promise(r => setTimeout(r, 450));
      if (list[i].val === num) {
        foundId = list[i].id;
        break;
      }
    }

    if (foundId) {
      triggerAudio(100);
      setListActive(foundId);
      setStatusMessage({
        text: `Found value ${num} in linked list!`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Value ${num} not found in list.`,
        type: 'error'
      });
    }
    setListActive(null);
  };

  const handleClearList = () => {
    setComplexityInfo({
      operation: 'Clear List',
      time: 'O(1) - Constant Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Clears list pointers.'
    });
    setList([]);
    setListActive(null);
    setStatusMessage({
      text: 'Linked list cleared successfully.',
      type: 'info'
    });
  };

  const handleTraverseList = async () => {
    setComplexityInfo({
      operation: 'Traverse / Search (sequential)',
      time: 'O(n) - Linear Time',
      space: 'O(1) - Auxiliary Space',
      desc: 'Walking through list sequentially from head to examine/print all node cells.'
    });

    for (let i = 0; i < list.length; i++) {
      setListActive(list[i].id);
      triggerAudio(list[i].val);
      await new Promise(r => setTimeout(r, 450));
    }
    setListActive(null);
  };

  // ==================== BINARY SEARCH TREE OPERATIONS ====================
  // Helper functions for BST node trees
  const insertNodeBST = (node, value) => {
    if (!node) return { value, id: ++nodeUniqueId, left: null, right: null };
    if (value < node.value) {
      node.left = insertNodeBST(node.left, value);
    } else if (value > node.value) {
      node.right = insertNodeBST(node.right, value);
    }
    return node;
  };

  const findMinBST = (node) => {
    while (node.left) node = node.left;
    return node;
  };

  const deleteNodeBST = (node, value) => {
    if (!node) return null;
    if (value < node.value) {
      node.left = deleteNodeBST(node.left, value);
    } else if (value > node.value) {
      node.right = deleteNodeBST(node.right, value);
    } else {
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      
      const minRight = findMinBST(node.right);
      node.value = minRight.value;
      node.right = deleteNodeBST(node.right, minRight.value);
    }
    return node;
  };

  // Collect visual coordinate data recursively
  const getBstNodesFlattened = (node, depth = 0, x = 50, xOffset = 25) => {
    if (!node) return [];
    
    // Calculate layout coordinates
    const y = 40 + depth * 70;
    const current = { 
      id: node.id, 
      value: node.value, 
      x: `${x}%`, 
      y: `${y}px`,
      depth
    };

    const left = getBstNodesFlattened(node.left, depth + 1, x - xOffset, xOffset / 1.8);
    const right = getBstNodesFlattened(node.right, depth + 1, x + xOffset, xOffset / 1.8);
    return [current, ...left, ...right];
  };

  const calculateBSTLines = () => {
    if (!bstRoot || !bstContainerRef.current) return;
    const lines = [];

    const recurseLines = (node, depth = 0, x = 50, xOffset = 25) => {
      if (!node) return;
      const y = 40 + depth * 70;

      if (node.left) {
        const leftX = x - xOffset;
        const leftY = 40 + (depth + 1) * 70;
        lines.push({ x1: `${x}%`, y1: `${y}px`, x2: `${leftX}%`, y2: `${leftY}px` });
        recurseLines(node.left, depth + 1, leftX, xOffset / 1.8);
      }
      if (node.right) {
        const rightX = x + xOffset;
        const rightY = 40 + (depth + 1) * 70;
        lines.push({ x1: `${x}%`, y1: `${y}px`, x2: `${rightX}%`, y2: `${rightY}px` });
        recurseLines(node.right, depth + 1, rightX, xOffset / 1.8);
      }
    };
    recurseLines(bstRoot);
    setBstLines(lines);
  };

  // Insert value into BST with traversal animations
  const handleInsertBST = async () => {
    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    setValInput('');
    setStatusMessage({
      text: `Inserting value ${num} into the BST...`,
      type: 'info'
    });

    let current = bstRoot;
    if (!current) {
      setBstRoot({ value: num, id: ++nodeUniqueId, left: null, right: null });
      setStatusMessage({
        text: `Inserted root node with value ${num}!`,
        type: 'success'
      });
      return;
    }

    // Traverse recursively showing path
    while (current) {
      setBstActive(current.value);
      triggerAudio(current.value);
      await new Promise(r => setTimeout(r, 500));

      if (num === current.value) {
        setStatusMessage({
          text: `Value ${num} already exists in the BST!`,
          type: 'warning'
        });
        setBstActive(null);
        return;
      }

      if (num < current.value) {
        if (!current.left) {
          current.left = { value: num, id: ++nodeUniqueId, left: null, right: null };
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = { value: num, id: ++nodeUniqueId, left: null, right: null };
          break;
        }
        current = current.right;
      }
    }

    setBstActive(num);
    triggerAudio(num);
    setBstRoot({ ...bstRoot }); // Trigger state updates
    setStatusMessage({
      text: `Successfully inserted value ${num} in the BST!`,
      type: 'success'
    });
    setTimeout(() => setBstActive(null), 600);
  };

  const handleSearchBST = async () => {
    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    setValInput('');
    setStatusMessage({
      text: `Searching BST for value ${num}...`,
      type: 'info'
    });
    let current = bstRoot;
    let found = false;

    while (current) {
      setBstActive(current.value);
      triggerAudio(current.value);
      await new Promise(r => setTimeout(r, 600));

      if (num === current.value) {
        found = true;
        break;
      }

      if (num < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    if (found) {
      triggerAudio(100);
      setStatusMessage({
        text: `Found value ${num} in the BST!`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Value ${num} not found in the BST.`,
        type: 'error'
      });
    }
    setBstActive(null);
  };

  const handleDeleteBST = () => {
    if (!valInput) return;
    const num = parseInt(valInput);
    if (isNaN(num)) return;

    setValInput('');
    triggerAudio(num);
    const updated = deleteNodeBST({ ...bstRoot }, num);
    setBstRoot(updated);
  };

  const handleClearBST = () => {
    setBstRoot(null);
    setBstActive(null);
    setBstLines([]);
  };

  const bstNodesFlattened = getBstNodesFlattened(bstRoot);

  return (
    <div className="ds-container">
      {/* Control Panel Area */}
      <div className="control-panel glass-card">
        <div className="control-group">
          <label>Value Input</label>
          <input
            type="number"
            className="text-input"
            style={{ width: '100px' }}
            placeholder="e.g. 42"
            value={valInput}
            onChange={(e) => setValInput(e.target.value)}
          />
        </div>

        {(activeTab === 'array' || activeTab === 'linkedlist') && (
          <div className="control-group">
            <label>Index (0-{activeTab === 'array' ? arr.length : list.length})</label>
            <input
              type="number"
              className="text-input"
              style={{ width: '80px' }}
              placeholder="index"
              value={idxInput}
              onChange={(e) => setIdxInput(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto', width: '100%' }}>
          {/* Stack Buttons */}
          {activeTab === 'stack' && (
            <>
              <button className="btn btn-primary" onClick={handlePush}>
                <Plus size={16} /> Push
              </button>
              <button className="btn btn-secondary" onClick={handlePop}>
                <Trash2 size={16} /> Pop
              </button>
              <button className="btn" onClick={handlePeekStack}>
                <Eye size={16} /> Peek / Top
              </button>
              <button className="btn" onClick={handleIsEmptyStack}>
                <HelpCircle size={16} /> isEmpty
              </button>
              <button className="btn" onClick={handleIsFullStack}>
                <HelpCircle size={16} /> isFull
              </button>
              <button className="btn" onClick={handleSearchStack}>
                <Search size={16} /> Search
              </button>
              <button className="btn btn-secondary" onClick={handleClearStack}>
                <Trash2 size={16} /> Clear Stack
              </button>
            </>
          )}

          {/* Queue Buttons */}
          {activeTab === 'queue' && (
            <>
              <button className="btn btn-primary" onClick={handleEnqueue}>
                <Plus size={16} /> Enqueue
              </button>
              <button className="btn btn-secondary" onClick={handleDequeue}>
                <Trash2 size={16} /> Dequeue
              </button>
              <button className="btn" onClick={handlePeekQueue}>
                <Eye size={16} /> Peek Front
              </button>
              <button className="btn" onClick={handlePeekRearQueue}>
                <Eye size={16} /> Peek Rear
              </button>
              <button className="btn" onClick={handleIsEmptyQueue}>
                <HelpCircle size={16} /> isEmpty
              </button>
              <button className="btn" onClick={handleSearchQueue}>
                <Search size={16} /> Search
              </button>
              <button className="btn btn-secondary" onClick={handleClearQueue}>
                <Trash2 size={16} /> Clear Queue
              </button>
            </>
          )}

          {/* Array Buttons */}
          {activeTab === 'array' && (
            <>
              <button className="btn" onClick={handleLookupArray}>
                <Search size={16} /> Access / Lookup
              </button>
              <button className="btn btn-primary" onClick={handleInsertArray}>
                <Plus size={16} /> Insertion
              </button>
              <button className="btn btn-secondary" onClick={handleDeleteArray}>
                <Trash2 size={16} /> Deletion
              </button>
              <button className="btn" onClick={handleUpdateArray}>
                <RefreshCw size={16} /> Update Index
              </button>
              <button className="btn" onClick={handleSearchArray}>
                <Search size={16} /> Linear Search
              </button>
              <button className="btn" onClick={handleBinarySearchArray}>
                <Search size={16} /> Binary Search
              </button>
              <button className="btn btn-secondary" onClick={handleClearArray}>
                <Trash2 size={16} /> Clear Array
              </button>
            </>
          )}

          {/* Linked List Buttons */}
          {activeTab === 'linkedlist' && (
            <>
              <button className="btn btn-primary" onClick={handleInsertListHead}>
                <Plus size={16} /> Insert Head
              </button>
              <button className="btn btn-primary" onClick={handleInsertListTail}>
                <Plus size={16} /> Insert Tail
              </button>
              <button className="btn btn-primary" onClick={handleInsertListAtIndex}>
                <Plus size={16} /> Insert In Middle
              </button>
              <button className="btn btn-secondary" onClick={handleDeleteListHead}>
                <Trash2 size={16} /> Delete Head
              </button>
              <button className="btn btn-secondary" onClick={handleDeleteListTail}>
                <Trash2 size={16} /> Delete Tail
              </button>
              <button className="btn btn-secondary" onClick={handleDeleteListAtIndex}>
                <Trash2 size={16} /> Delete Node
              </button>
              <button className="btn" onClick={handleSearchList}>
                <Search size={16} /> Traverse / Search
              </button>
              <button className="btn" onClick={handleTraverseList}>
                <RefreshCw size={16} /> Traverse (Step)
              </button>
              <button className="btn btn-secondary" onClick={handleClearList}>
                <Trash2 size={16} /> Clear List
              </button>
            </>
          )}

          {/* BST Buttons */}
          {activeTab === 'bst' && (
            <>
              <button className="btn btn-primary" onClick={handleInsertBST}>
                <Plus size={16} /> Insert
              </button>
              <button className="btn" onClick={handleSearchBST}>
                <Search size={16} /> Search
              </button>
              <button className="btn btn-secondary" onClick={handleDeleteBST}>
                <Trash2 size={16} /> Delete
              </button>
              <button className="btn btn-secondary" onClick={handleClearBST}>
                <Trash2 size={16} /> Clear Tree
              </button>
            </>
          )}

          {/* Sound Toggle Button */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            {soundEnabled ? (
              <button className="btn" onClick={() => setSoundEnabled(false)} title="Mute audio">
                <Volume2 size={16} />
              </button>
            ) : (
              <button className="btn" onClick={() => setSoundEnabled(true)} title="Enable audio">
                <VolumeX size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visualizer Panel Body */}
      <div className="ds-panel-body">
        {/* Status Message Banner */}
        {statusMessage && (
          <div className={`status-banner banner-${statusMessage.type} glass-card`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-dot" />
              <span className="status-text">{statusMessage.text}</span>
            </div>
            <button className="status-close-btn" onClick={() => setStatusMessage(null)}>
              &times;
            </button>
          </div>
        )}

        {/* 1. STACK DISPLAY */}
        {activeTab === 'stack' && (
          <div className="stack-wrapper">
            <div className="stack-bucket">
              {stack.map((item, idx) => {
                const isActive = stackActive && stackActive.idx === idx;
                const isPop = isActive && stackActive.type === 'pop';
                const isPush = isActive && stackActive.type === 'push';
                const isPeek = isActive && stackActive.type === 'peek';

                let itemClass = 'stack-element';
                if (isPush) itemClass += ' animated-push';
                if (isPop) itemClass += ' animated-pop';
                if (isPeek) itemClass += ' highlighted';

                return (
                  <div key={idx} className={itemClass}>
                    {item}
                    {idx === stack.length - 1 && (
                      <span className="stack-badge-top">Top</span>
                    )}
                  </div>
                );
              })}
              {stack.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>Stack is Empty</span>}
            </div>
          </div>
        )}

        {/* 2. QUEUE DISPLAY */}
        {activeTab === 'queue' && (
          <div className="queue-wrapper">
            <div className="queue-tube">
              {queue.map((item, idx) => {
                const isActive = queueActive && queueActive.idx === idx;
                const isEnqueue = isActive && queueActive.type === 'enqueue';
                const isDequeue = isActive && queueActive.type === 'dequeue';
                const isPeek = isActive && queueActive.type === 'peek';

                let itemClass = 'queue-element';
                if (isEnqueue) itemClass += ' animated-enqueue';
                if (isDequeue) itemClass += ' animated-dequeue';
                if (isPeek) itemClass += ' highlighted';

                return (
                  <div key={idx} className={itemClass}>
                    {item}
                    {idx === 0 && <span className="queue-element-badge front">Front</span>}
                    {idx === queue.length - 1 && <span className="queue-element-badge rear">Rear</span>}
                  </div>
                );
              })}
              {queue.length === 0 && <span style={{ color: 'var(--text-secondary)', margin: 'auto' }}>Queue is Empty</span>}
            </div>
          </div>
        )}

        {/* 3. ARRAY DISPLAY */}
        {activeTab === 'array' && (
          <div className="array-wrapper">
            <div className="array-grid">
              {arr.map((item, idx) => {
                const isActive = arrActive && arrActive.indices.includes(idx);
                const isLow = arrActive && arrActive.low === idx;
                const isHigh = arrActive && arrActive.high === idx;
                const isMid = arrActive && arrActive.mid === idx;

                let cellClass = 'array-cell';
                if (isActive) {
                  if (arrActive.type === 'compare') cellClass += ' active-compare';
                  else if (arrActive.type === 'swap') cellClass += ' active-swap';
                  else if (arrActive.type === 'found') cellClass += ' active-found';
                }
                if (isLow) cellClass += ' active-low';
                if (isHigh) cellClass += ' active-high';
                if (isMid) cellClass += ' active-mid';

                return (
                  <div key={idx} className="array-cell-container">
                    <div className={cellClass}>{item}</div>
                    <span className="array-index">
                      [{idx}]
                      {isLow && <span className="array-ptr-label low"> L</span>}
                      {isHigh && <span className="array-ptr-label high"> H</span>}
                      {isMid && <span className="array-ptr-label mid"> M</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. LINKED LIST DISPLAY */}
        {activeTab === 'linkedlist' && (
          <div className="list-wrapper" ref={listContainerRef}>
            <div className="list-nodes-container">
              {list.map((node, idx) => {
                const isHighlighted = listActive === node.id;
                return (
                  <div 
                    key={node.id} 
                    className={`list-node ${isHighlighted ? 'highlighted' : ''}`}
                  >
                    <div className="list-node-val">{node.val}</div>
                    <div className="list-node-next">
                      {idx === list.length - 1 ? 'null' : 'ptr'}
                    </div>
                  </div>
                );
              })}
              {list.length === 0 && <span className="null-node">List is Empty</span>}
            </div>

            {/* SVG Connecting Arrows */}
            <svg className="list-arrow-svg">
              <defs>
                <marker 
                  id="arrow" 
                  viewBox="0 0 10 10" 
                  refX="6" 
                  refY="5" 
                  markerWidth="6" 
                  markerHeight="6" 
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent)" />
                </marker>
                <marker 
                  id="arrow-highlighted" 
                  viewBox="0 0 10 10" 
                  refX="6" 
                  refY="5" 
                  markerWidth="6" 
                  markerHeight="6" 
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--highlight)" />
                </marker>
              </defs>
              {arrowCoords.map((coord, idx) => {
                const isHighlighted = listActive === coord.fromId;
                return (
                  <line
                    key={idx}
                    x1={coord.x1}
                    y1={coord.y1}
                    x2={coord.x2}
                    y2={coord.y2}
                    className={`arrow-path ${isHighlighted ? 'highlighted' : ''}`}
                    stroke={isHighlighted ? 'var(--highlight)' : 'var(--accent)'}
                    markerEnd={`url(#${isHighlighted ? 'arrow-highlighted' : 'arrow'})`}
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* 5. BST DISPLAY */}
        {activeTab === 'bst' && (
          <div className="bst-wrapper" ref={bstContainerRef}>
            <svg className="bst-node-svg">
              {bstLines.map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="var(--card-border)"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {bstNodesFlattened.map((node) => {
              const isHighlighted = bstActive === node.value;
              return (
                <div
                  key={node.id}
                  className={`bst-node-circle ${isHighlighted ? 'highlighted' : ''}`}
                  style={{ left: node.x, top: node.y }}
                >
                  {node.value}
                </div>
              );
            })}
            {!bstRoot && <span style={{ color: 'var(--text-secondary)' }}>Tree is Empty</span>}
          </div>
        )}
      </div>

      {/* 6. COMPLEXITY BOX PANEL */}
      {complexityInfo.operation && (
        <div className="complexity-card glass-card">
          <div className="complexity-grid">
            <span className="complexity-title">Last Operation:</span>
            <span className="complexity-value">{complexityInfo.operation}</span>
            
            <span className="complexity-title">Time Complexity:</span>
            <span className="complexity-value">{complexityInfo.time}</span>
            
            <span className="complexity-title">Space Complexity:</span>
            <span className="complexity-value">{complexityInfo.space}</span>
            
            <span className="complexity-title">Description:</span>
            <span className="complexity-value" style={{ gridColumn: '2', fontFamily: 'inherit', fontWeight: 'normal' }}>
              {complexityInfo.desc}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataStructuresVisualizer;
