#! /usr/bin/env ruby
# All are intervals from root:

octaves = [4,5,6]

notes = %w{c c# d d# e f f# g g# a a# b}.map {|n| n.upcase}

unless ARGV[0] && ARGV[1]
  puts "Usage: scales.rb ROOT SCALE"
  exit
end

root = ARGV[0].upcase

unless notes.include?(root)
  puts "Not a valid note"
  exit
end

scales = { major:      [2, 2, 1, 2, 2, 2, 1],
           minor:      [2, 1, 2, 2, 1, 2, 2],
           dorian:     [2, 1, 2, 2, 2, 1, 2],
           lydian:     [2, 2, 2, 1, 2, 2, 1],
           mixolydian: [2, 2, 1, 2, 2, 1, 2],
           phrygian:   [1, 2, 2, 2, 1, 2, 2],
           locrian:    [1, 2, 2, 1, 2, 2, 2],
           pentatonic: [3, 2, 2, 3, 2],
           blues:      [3, 2, 1, 1, 3, 2],
}

all_notes = []
octaves.each do |octave|
  notes.each do |note|
    all_notes << "#{note}#{octave}"
  end
end

while all_notes.first.gsub(/\d/,'') != root
  all_notes.shift
end

all_notes_beginning_with_root = all_notes
scale = scales[ARGV[1].to_sym]

output_scale = []

output_scale << all_notes_beginning_with_root.first

while all_notes_beginning_with_root.any?
  scale.first.times do
    all_notes_beginning_with_root.shift
  end
  output_scale << all_notes_beginning_with_root.first
  scale.rotate!
end

output_scale = output_scale.reject {|n| n.nil?}[0,14]

puts "#{output_scale.length} notes"

p output_scale


